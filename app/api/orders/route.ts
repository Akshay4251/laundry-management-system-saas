// app/api/orders/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMode,
  OrderType,
  Prisma
} from '@prisma/client';
import {
  apiResponse,
  createPagination,
  handlePrismaError
} from '@/lib/api-response';
import { createNotificationForBusiness } from '@/lib/notifications/create-notification';

// ============================================================================
// HELPER: Generate Items Summary
// ============================================================================

interface ItemsSummary {
  total: number;
  names: string[];
  preview: string;
}

function generateItemsSummary(
  items: { itemName: string; treatmentName: string | null; quantity: number }[],
  maxPreview: number = 2
): ItemsSummary {
  const names = items.map(item => item.itemName);
  const total = items.length;

  let preview: string;
  if (total === 0) {
    preview = 'No items';
  } else if (total <= maxPreview) {
    preview = items
      .map(i => `${i.itemName}${i.treatmentName ? ` (${i.treatmentName})` : ''}`)
      .join(', ');
  } else {
    const shown = items
      .slice(0, maxPreview)
      .map(i => `${i.itemName}${i.treatmentName ? ` (${i.treatmentName})` : ''}`)
      .join(', ');
    const remaining = total - maxPreview;
    preview = `${shown} + ${remaining} more`;
  }

  return { total, names, preview };
}

// ============================================================================
// GET /api/orders - List Orders with Filters
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.notFound('Business not found');
    }

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const storeId = searchParams.get('storeId');
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status') as OrderStatus | null;
    const orderType = searchParams.get('orderType') as OrderType | null;
    const paymentStatus = searchParams.get('paymentStatus') as PaymentStatus | null;
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Prisma.OrderWhereInput = {
      businessId,
      ...(storeId && { storeId }),
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(orderType && { orderType }),
      ...(paymentStatus && { paymentStatus }),
      ...(dateFrom && {
        createdAt: { gte: new Date(dateFrom) },
      }),
      ...(dateTo && {
        createdAt: { lte: new Date(dateTo) },
      }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customer: { fullName: { contains: search, mode: 'insensitive' } } },
          { customer: { phone: { contains: search } } },
        ],
      }),
    };

    // Execute queries in parallel
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },

        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
              address: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },

          // ✅ ADDED: driver include for assignment UI
          driver: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
            },
          },

          items: {
            select: {
              id: true,
              itemName: true,
              treatmentName: true,
              quantity: true,
              status: true,
              sentToWorkshop: true,
              workshopReturnedDate: true,
            },
          },
          _count: {
            select: {
              items: true,
              payments: true,
            },
          },
        },
      }),

      prisma.order.count({ where }),
    ]);

    // Transform data
    const transformedOrders = orders.map((order) => {
      // Count workshop items (currently at workshop)
      const workshopItems = order.items.filter(
        (item) => item.sentToWorkshop && item.status === 'AT_WORKSHOP' && !item.workshopReturnedDate
      ).length;

      // Generate items summary object
      const itemsSummary = generateItemsSummary(order.items);

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderType: order.orderType,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMode: order.paymentMode,
        priority: order.priority,
        isExpress: order.priority === 'EXPRESS',
        customer: order.customer,
        store: order.store,

        // ✅ ADDED: driver assignment fields
        driverId: order.driverId,
        driver: order.driver
          ? {
              id: order.driver.id,
              fullName: order.driver.fullName,
              phone: order.driver.phone,
              email: order.driver.email,
            }
          : null,

        subtotal: order.subtotal ? parseFloat(order.subtotal.toString()) : null,
        gstEnabled: order.gstEnabled,
        gstPercentage: order.gstPercentage ? parseFloat(order.gstPercentage.toString()) : null,
        gstAmount: order.gstAmount ? parseFloat(order.gstAmount.toString()) : null,
        totalAmount: parseFloat(order.totalAmount.toString()),
        paidAmount: parseFloat(order.paidAmount.toString()),
        discount: order.discount ? parseFloat(order.discount.toString()) : null,
        tax: order.tax ? parseFloat(order.tax.toString()) : null,
        dueAmount: parseFloat(order.totalAmount.toString()) - parseFloat(order.paidAmount.toString()),
        pickupDate: order.pickupDate,
        deliveryDate: order.deliveryDate,
        completedDate: order.completedDate,
        specialInstructions: order.specialInstructions,
        assignedTo: order.assignedTo,
        totalItems: order._count.items,
        totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),

        // Rework fields
        isRework: order.isRework,
        reworkCount: order.reworkCount,
        reworkReason: order.reworkReason,

        // Computed fields
        workshopItems,
        itemsSummary,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return apiResponse.success({
      orders: transformedOrders,
      pagination: createPagination(totalCount, page, limit),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to fetch orders');
  }
}

// ============================================================================
// POST /api/orders - Create New Order
// ============================================================================

interface OrderItemInput {
  itemId: string;
  treatmentId: string;
  quantity: number;
  unitPrice: number;
  expressPrice?: number | null;
  notes?: string | null;
}

interface CreateOrderInput {
  storeId: string;
  customerId: string;
  orderType?: 'PICKUP' | 'WALKIN';
  isExpress?: boolean;
  items?: OrderItemInput[];
  pickupDate?: string;
  deliveryDate?: string;
  notes?: string;
  paymentMethod?: PaymentMode;
  paidAmount?: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  // GST fields from client
  subtotal?: number;
  gstEnabled?: boolean;
  gstPercentage?: number;
  gstAmount?: number;
  total?: number;
  // For PICKUP orders without items
  estimatedItems?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.notFound('Business not found');
    }

    const body: CreateOrderInput = await req.json();

    const {
      storeId,
      customerId,
      orderType = 'WALKIN',
      isExpress = false,
      items = [],
      pickupDate,
      deliveryDate,
      notes,
      paymentMethod,
      paidAmount = 0,
      discountAmount = 0,
      subtotal: providedSubtotal,
      gstEnabled: providedGstEnabled,
      gstPercentage: providedGstPercentage,
      gstAmount: providedGstAmount,
      total: providedTotal,
      estimatedItems,
    } = body;

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════

    if (!storeId || !customerId) {
      return apiResponse.badRequest('Store and customer are required');
    }

    if (!['PICKUP', 'WALKIN'].includes(orderType)) {
      return apiResponse.badRequest('Invalid order type. Must be PICKUP or WALKIN');
    }

    if (orderType === 'WALKIN' && items.length === 0) {
      return apiResponse.badRequest('Walk-in orders must have at least one item');
    }

    if (orderType === 'PICKUP' && !pickupDate) {
      return apiResponse.badRequest('Pickup date is required for pickup orders');
    }

    // Verify store belongs to business
    const store = await prisma.store.findFirst({
      where: { id: storeId, businessId, isActive: true },
    });

    if (!store) {
      return apiResponse.notFound('Store not found or inactive');
    }

    // Verify customer belongs to business
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, businessId, deletedAt: null },
    });

    if (!customer) {
      return apiResponse.notFound('Customer not found');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GET BUSINESS SETTINGS FOR GST
    // ═══════════════════════════════════════════════════════════════════════

    const businessSettings = await prisma.businessSettings.findUnique({
      where: { businessId },
      select: {
        gstEnabled: true,
        gstPercentage: true,
      },
    });

    const gstEnabled = providedGstEnabled ?? businessSettings?.gstEnabled ?? false;
    const gstPercentage =
      providedGstPercentage ??
      (businessSettings?.gstPercentage ? parseFloat(businessSettings.gstPercentage.toString()) : 18);

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATE ITEMS (if provided)
    // ═══════════════════════════════════════════════════════════════════════

    let itemMap = new Map();
    let treatmentMap = new Map();

    if (items.length > 0) {
      const itemIds = [...new Set(items.map((i) => i.itemId))];
      const treatmentIds = [...new Set(items.map((i) => i.treatmentId))];

      const [dbItems, dbTreatments] = await Promise.all([
        prisma.item.findMany({
          where: { id: { in: itemIds }, businessId, isActive: true, deletedAt: null },
        }),
        prisma.treatment.findMany({
          where: { id: { in: treatmentIds }, businessId, isActive: true },
        }),
      ]);

      itemMap = new Map(dbItems.map((i) => [i.id, i]));
      treatmentMap = new Map(dbTreatments.map((t) => [t.id, t]));

      for (const item of items) {
        if (!itemMap.has(item.itemId)) {
          return apiResponse.badRequest(`Item not found: ${item.itemId}`);
        }
        if (!treatmentMap.has(item.treatmentId)) {
          return apiResponse.badRequest(`Treatment not found: ${item.treatmentId}`);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CALCULATE TOTALS
    // ═══════════════════════════════════════════════════════════════════════

    let calculatedSubtotal = 0;
    if (items.length > 0) {
      calculatedSubtotal = items.reduce((sum, item) => {
        const price = isExpress && item.expressPrice ? item.expressPrice : item.unitPrice;
        return sum + price * item.quantity;
      }, 0);
    }

    const subtotal = providedSubtotal ?? calculatedSubtotal;

    // Calculate GST
    let gstAmount = 0;
    if (gstEnabled && subtotal > 0) {
      gstAmount = providedGstAmount ?? Math.round((subtotal * gstPercentage) / 100 * 100) / 100;
    }

    // Calculate total
    const totalAmount = providedTotal ?? (subtotal - discountAmount + gstAmount);

    // Determine payment status
    let paymentStatus: PaymentStatus = 'UNPAID';
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DETERMINE INITIAL STATUS
    // ═══════════════════════════════════════════════════════════════════════

    const initialStatus: OrderStatus = orderType === 'PICKUP' ? 'PICKUP' : 'IN_PROGRESS';

    // Generate unique order number
    const orderNumber = await generateOrderNumber(businessId, storeId);

    // ═══════════════════════════════════════════════════════════════════════
    // CREATE ORDER IN TRANSACTION
    // ═══════════════════════════════════════════════════════════════════════

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          businessId,
          storeId,
          customerId,
          orderNumber,
          orderType: orderType as OrderType,
          status: initialStatus,
          priority: isExpress ? 'EXPRESS' : 'NORMAL',

          subtotal: subtotal || 0,
          gstEnabled,
          gstPercentage: gstEnabled ? gstPercentage : null,
          gstAmount: gstEnabled ? gstAmount : null,
          totalAmount: totalAmount || 0,
          paidAmount,
          discount: discountAmount,
          tax: 0,

          paymentStatus,
          paymentMode: paymentMethod || null,

          pickupDate: pickupDate ? new Date(pickupDate) : null,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          specialInstructions: notes || estimatedItems || null,

          isRework: false,
          reworkCount: 0,
        },
      });

      if (items.length > 0) {
        await Promise.all(
          items.map(async (item, index) => {
            const dbItem = itemMap.get(item.itemId)!;
            const dbTreatment = treatmentMap.get(item.treatmentId)!;

            const tagNumber = generateTagNumber(orderNumber, index + 1);
            const price = isExpress && item.expressPrice ? item.expressPrice : item.unitPrice;

            return tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                storeId,
                itemId: item.itemId,
                treatmentId: item.treatmentId,
                tagNumber,
                itemName: dbItem.name,
                treatmentName: dbTreatment.name,
                quantity: item.quantity,
                status: orderType === 'PICKUP' ? 'RECEIVED' : 'IN_PROGRESS',
                unitPrice: item.unitPrice,
                subtotal: price * item.quantity,
                isExpress,
                notes: item.notes || null,
              },
            });
          })
        );
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          toStatus: initialStatus,
          changedBy: session.user?.id || 'system',
          notes:
            orderType === 'PICKUP'
              ? `Pickup scheduled for ${new Date(pickupDate!).toLocaleDateString()}`
              : isExpress
                ? 'Express walk-in order created - priority processing'
                : 'Walk-in order created - processing started',
        },
      });

      if (paidAmount > 0 && paymentMethod) {
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            amount: paidAmount,
            mode: paymentMethod,
            notes: 'Initial payment at order creation',
          },
        });
      }

      if (items.length > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            lastOrderDate: new Date(),
            totalOrders: { increment: 1 },
            totalSpent: { increment: totalAmount || 0 },
          },
        });
      }

      return newOrder;
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 🔔 CREATE NOTIFICATION (Outside transaction)
    // ═══════════════════════════════════════════════════════════════════════

    try {
      await createNotificationForBusiness({
        businessId,
        type: 'ORDER_CREATED',
        title: orderType === 'PICKUP'
          ? `📦 New pickup order scheduled`
          : isExpress
            ? `⚡ New express order`
            : `🛍️ New walk-in order`,
        message: `Order #${orderNumber} from ${customer.fullName} - ₹${totalAmount.toFixed(2)}`,
        data: {
          orderId: order.id,
          orderNumber,
          customerId,
          customerName: customer.fullName,
          orderType,
          totalAmount: totalAmount.toString(),
          isExpress,
          itemsCount: items.length,
        },
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FETCH COMPLETE ORDER FOR RESPONSE
    // ═══════════════════════════════════════════════════════════════════════

    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            address: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                iconUrl: true,
              },
            },
            treatment: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        payments: true,
      },
    });

    const responseData = {
      id: completeOrder!.id,
      orderNumber: completeOrder!.orderNumber,
      orderType: completeOrder!.orderType,
      status: completeOrder!.status,
      priority: completeOrder!.priority,
      paymentStatus: completeOrder!.paymentStatus,
      paymentMode: completeOrder!.paymentMode,
      isExpress,
      customer: completeOrder!.customer,
      store: completeOrder!.store,
      items: completeOrder!.items.map((item) => ({
        id: item.id,
        tagNumber: item.tagNumber,
        itemId: item.itemId,
        itemName: item.itemName,
        itemIcon: item.item?.iconUrl,
        treatmentId: item.treatmentId,
        treatmentName: item.treatmentName,
        treatmentCode: item.treatment?.code,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        subtotal: parseFloat(item.subtotal.toString()),
        status: item.status,
        isExpress: item.isExpress,
        notes: item.notes,
      })),
      subtotal: completeOrder!.subtotal ? parseFloat(completeOrder!.subtotal.toString()) : subtotal,
      gstEnabled: completeOrder!.gstEnabled,
      gstPercentage: completeOrder!.gstPercentage ? parseFloat(completeOrder!.gstPercentage.toString()) : null,
      gstAmount: completeOrder!.gstAmount ? parseFloat(completeOrder!.gstAmount.toString()) : null,
      discount: discountAmount,
      totalAmount: parseFloat(completeOrder!.totalAmount.toString()),
      paidAmount: parseFloat(completeOrder!.paidAmount.toString()),
      dueAmount:
        parseFloat(completeOrder!.totalAmount.toString()) -
        parseFloat(completeOrder!.paidAmount.toString()),
      pickupDate: completeOrder!.pickupDate,
      deliveryDate: completeOrder!.deliveryDate,
      specialInstructions: completeOrder!.specialInstructions,
      isRework: completeOrder!.isRework,
      reworkCount: completeOrder!.reworkCount,
      createdAt: completeOrder!.createdAt,
    };

    const successMessage =
      orderType === 'PICKUP'
        ? '📦 Pickup order scheduled successfully!'
        : isExpress
          ? '⚡ Express order created!'
          : '✅ Order created successfully!';

    return apiResponse.created(responseData, successMessage);
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to create order');
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function generateOrderNumber(businessId: string, storeId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { name: true },
  });

  const storeCode =
    store?.name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'STR';

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const todayOrderCount = await prisma.order.count({
    where: {
      businessId,
      storeId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const sequenceNumber = (todayOrderCount + 1).toString().padStart(4, '0');

  return `${storeCode}-${year}${month}${day}-${sequenceNumber}`;
}

function generateTagNumber(orderNumber: string, itemIndex: number): string {
  const itemNumber = itemIndex.toString().padStart(3, '0');
  return `${orderNumber}-${itemNumber}`;
}