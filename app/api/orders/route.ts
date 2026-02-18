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
import {
  generateOrderNumber,
  generateTagNumber,
  createOrderWithRetry,
} from '@/lib/order-utils';

// ============================================================================
// HELPER: Generate Items Summary
// ============================================================================

interface ItemsSummary {
  total: number;
  names: string[];
  preview: string;
}

function generateItemsSummary(
  items: { itemName: string; serviceName: string | null; quantity: number }[],
  maxPreview: number = 2
): ItemsSummary {
  const names = items.map(item => item.itemName);
  const total = items.length;

  let preview: string;
  if (total === 0) {
    preview = 'No items';
  } else if (total <= maxPreview) {
    preview = items
      .map(i => `${i.itemName}${i.serviceName ? ` (${i.serviceName})` : ''}`)
      .join(', ');
  } else {
    const shown = items
      .slice(0, maxPreview)
      .map(i => `${i.itemName}${i.serviceName ? ` (${i.serviceName})` : ''}`)
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
              serviceName: true,
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

    const transformedOrders = orders.map((order) => {
      const workshopItems = order.items.filter(
        (item) => item.sentToWorkshop && item.status === 'AT_WORKSHOP' && !item.workshopReturnedDate
      ).length;

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
        isRework: order.isRework,
        reworkCount: order.reworkCount,
        reworkReason: order.reworkReason,
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
  serviceId: string;
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
  subtotal?: number;
  gstEnabled?: boolean;
  gstPercentage?: number;
  gstAmount?: number;
  total?: number;
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

    const store = await prisma.store.findFirst({
      where: { id: storeId, businessId, isActive: true },
    });

    if (!store) {
      return apiResponse.notFound('Store not found or inactive');
    }

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
    let serviceMap = new Map();

    if (items.length > 0) {
      const itemIds = [...new Set(items.map((i) => i.itemId))];
      const serviceIds = [...new Set(items.map((i) => i.serviceId))];

      const [dbItems, dbServices] = await Promise.all([
        prisma.item.findMany({
          where: { id: { in: itemIds }, businessId, isActive: true, deletedAt: null },
        }),
        prisma.service.findMany({
          where: { id: { in: serviceIds }, businessId, isActive: true },
        }),
      ]);

      itemMap = new Map(dbItems.map((i) => [i.id, i]));
      serviceMap = new Map(dbServices.map((t) => [t.id, t]));

      for (const item of items) {
        if (!itemMap.has(item.itemId)) {
          return apiResponse.badRequest(`Item not found: ${item.itemId}`);
        }
        if (!serviceMap.has(item.serviceId)) {
          return apiResponse.badRequest(`Service not found: ${item.serviceId}`);
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

    let gstAmount = 0;
    if (gstEnabled && subtotal > 0) {
      gstAmount = providedGstAmount ?? Math.round((subtotal * gstPercentage) / 100 * 100) / 100;
    }

    const totalAmount = providedTotal ?? (subtotal - discountAmount + gstAmount);

    let paymentStatus: PaymentStatus = 'UNPAID';
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    }

    const initialStatus: OrderStatus = orderType === 'PICKUP' ? 'PICKUP' : 'IN_PROGRESS';

    // ═══════════════════════════════════════════════════════════════════════
    // CREATE ORDER WITH RETRY (handles race conditions from ALL sources)
    // ═══════════════════════════════════════════════════════════════════════

    const result = await createOrderWithRetry(async () => {
      const orderNumber = await generateOrderNumber(businessId, storeId);

      const newOrder = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
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
              const dbService = serviceMap.get(item.serviceId)!;

              const tagNumber = generateTagNumber(orderNumber, index + 1);
              const price = isExpress && item.expressPrice ? item.expressPrice : item.unitPrice;

              return tx.orderItem.create({
                data: {
                  orderId: created.id,
                  storeId,
                  itemId: item.itemId,
                  serviceId: item.serviceId,
                  tagNumber,
                  itemName: dbItem.name,
                  serviceName: dbService.name,
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
            orderId: created.id,
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
              orderId: created.id,
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

        return created;
      });

      return { order: newOrder, orderNumber };
    });

    if (!result.success) {
      return apiResponse.error(result.error);
    }

    const { order, orderNumber } = result.data;

    // ═══════════════════════════════════════════════════════════════════════
    // 🔔 CREATE NOTIFICATION
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
            service: {
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
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        serviceCode: item.service?.code,
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