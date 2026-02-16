// app/api/orders/[id]/items/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse, handlePrismaError } from '@/lib/api-response';
import { Prisma } from '@prisma/client';

// ============================================================================
// POST /api/orders/[id]/items - Add items to existing PICKUP order
// ============================================================================

interface AddItemInput {
  itemId: string;
  treatmentId: string;
  quantity: number;
  unitPrice: number;
  expressPrice?: number | null;
  notes?: string | null;
  color?: string | null;
  brand?: string | null;
}

interface AddItemsInput {
  items: AddItemInput[];
  isExpress?: boolean;
  transitionToInProgress?: boolean;
  deliveryDate?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.notFound('Business not found');
    }

    const { id: orderId } = await params;
    const body: AddItemsInput = await req.json();

    const { 
      items, 
      isExpress = false,
      transitionToInProgress = true,
      deliveryDate,
    } = body;

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════

    if (!items || items.length === 0) {
      return apiResponse.badRequest('At least one item is required');
    }

    // Fetch the order
    const order = await prisma.order.findFirst({
      where: { id: orderId, businessId },
      include: {
        items: true,
        customer: { select: { id: true, fullName: true } },
        store: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      return apiResponse.notFound('Order not found');
    }

    // Only allow adding items to PICKUP orders (or IN_PROGRESS for corrections)
    const allowedStatuses = ['PICKUP', 'IN_PROGRESS'];
    if (!allowedStatuses.includes(order.status)) {
      return apiResponse.badRequest(
        `Cannot add items to order in ${order.status} status. ` +
        `Only PICKUP or IN_PROGRESS orders can have items added.`
      );
    }

    // Validate delivery date for PICKUP orders without one
    if (order.status === 'PICKUP' && !order.deliveryDate && !deliveryDate) {
      return apiResponse.badRequest(
        'Delivery date is required when adding items to a pickup order without a delivery date'
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATE ITEMS & TREATMENTS
    // ═══════════════════════════════════════════════════════════════════════

    const itemIds = [...new Set(items.map(i => i.itemId))];
    const treatmentIds = [...new Set(items.map(i => i.treatmentId))];

    const [dbItems, dbTreatments] = await Promise.all([
      prisma.item.findMany({
        where: { id: { in: itemIds }, businessId, isActive: true, deletedAt: null },
      }),
      prisma.treatment.findMany({
        where: { id: { in: treatmentIds }, businessId, isActive: true },
      }),
    ]);

    const itemMap = new Map(dbItems.map(i => [i.id, i]));
    const treatmentMap = new Map(dbTreatments.map(t => [t.id, t]));

    // Validate each item
    for (const item of items) {
      if (!itemMap.has(item.itemId)) {
        return apiResponse.badRequest(`Item not found: ${item.itemId}`);
      }
      if (!treatmentMap.has(item.treatmentId)) {
        return apiResponse.badRequest(`Treatment not found: ${item.treatmentId}`);
      }
      if (item.quantity < 1) {
        return apiResponse.badRequest('Quantity must be at least 1');
      }
      if (item.unitPrice < 0) {
        return apiResponse.badRequest('Price cannot be negative');
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CALCULATE TOTALS
    // ═══════════════════════════════════════════════════════════════════════

    const EXPRESS_MULTIPLIER = 1.5;

    let newItemsSubtotal = 0;
    items.forEach(item => {
      const price = isExpress && item.expressPrice 
        ? item.expressPrice 
        : isExpress 
        ? Math.round(item.unitPrice * EXPRESS_MULTIPLIER)
        : item.unitPrice;
      newItemsSubtotal += price * item.quantity;
    });

    // Calculate new order totals
    const existingSubtotal = order.items.reduce(
      (sum, item) => sum + parseFloat(item.subtotal.toString()), 
      0
    );
    const totalSubtotal = existingSubtotal + newItemsSubtotal;
    
    // Recalculate tax (18% GST)
    const existingDiscount = order.discount ? parseFloat(order.discount.toString()) : 0;
    const taxableAmount = totalSubtotal - existingDiscount;
    const newTax = Math.round(taxableAmount * 0.18);
    const newTotal = taxableAmount + newTax;

    // Get current item count for tag numbering
    const existingItemCount = order.items.length;

    // ═══════════════════════════════════════════════════════════════════════
    // CREATE ITEMS IN TRANSACTION
    // ═══════════════════════════════════════════════════════════════════════

    const result = await prisma.$transaction(async (tx) => {
      // Create order items
      const createdItems = await Promise.all(
        items.map(async (item, index) => {
          const dbItem = itemMap.get(item.itemId)!;
          const dbTreatment = treatmentMap.get(item.treatmentId)!;
          
          const tagNumber = generateTagNumber(
            order.orderNumber, 
            existingItemCount + index + 1
          );
          
          const price = isExpress && item.expressPrice
            ? item.expressPrice
            : isExpress
            ? Math.round(item.unitPrice * EXPRESS_MULTIPLIER)
            : item.unitPrice;

          return tx.orderItem.create({
            data: {
              orderId: order.id,
              storeId: order.storeId,
              itemId: item.itemId,
              treatmentId: item.treatmentId,
              tagNumber,
              itemName: dbItem.name,
              treatmentName: dbTreatment.name,
              quantity: item.quantity,
              status: 'IN_PROGRESS',
              unitPrice: item.unitPrice,
              subtotal: price * item.quantity,
              isExpress,
              notes: item.notes || null,
              color: item.color || null,
              brand: item.brand || null,
            },
            include: {
              item: { select: { id: true, name: true, iconUrl: true } },
              treatment: { select: { id: true, name: true, code: true } },
            },
          });
        })
      );

      // Determine new order status
      const shouldTransition = transitionToInProgress && order.status === 'PICKUP';
      const newStatus = shouldTransition ? 'IN_PROGRESS' : order.status;
      const newPriority = isExpress ? 'EXPRESS' : order.priority;

      // Prepare delivery date update
      // Only update if provided and order doesn't already have one
      const deliveryDateUpdate = deliveryDate && !order.deliveryDate
        ? new Date(deliveryDate)
        : order.deliveryDate;

      // Update order totals, status, and delivery date
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          priority: newPriority,
          totalAmount: newTotal,
          tax: newTax,
          ...(deliveryDate && !order.deliveryDate && { deliveryDate: new Date(deliveryDate) }),
        },
      });

      // Create status history if transitioning
      if (shouldTransition) {
        const deliveryInfo = deliveryDateUpdate 
          ? ` Delivery expected: ${new Date(deliveryDateUpdate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}.`
          : '';
        
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: 'PICKUP',
            toStatus: 'IN_PROGRESS',
            changedBy: session.user?.id || 'system',
            notes: `Items received (${items.length} items added). Processing started.${deliveryInfo}`,
          },
        });

        // Update customer analytics (only on first items addition)
        if (order.items.length === 0) {
          await tx.customer.update({
            where: { id: order.customerId },
            data: {
              lastOrderDate: new Date(),
              totalOrders: { increment: 1 },
              totalSpent: { increment: newTotal },
            },
          });
        }
      }

      return {
        items: createdItems,
        order: updatedOrder,
        transitioned: shouldTransition,
      };
    });

    // ═══════════════════════════════════════════════════════════════════════
    // BUILD RESPONSE
    // ═══════════════════════════════════════════════════════════════════════

    const responseItems = result.items.map(item => ({
      id: item.id,
      tagNumber: item.tagNumber,
      itemId: item.itemId,
      itemName: item.itemName,
      itemIcon: item.item?.iconUrl || null,
      treatmentId: item.treatmentId,
      treatmentName: item.treatmentName,
      treatmentCode: item.treatment?.code || null,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice.toString()),
      subtotal: parseFloat(item.subtotal.toString()),
      status: item.status,
      isExpress: item.isExpress,
      notes: item.notes,
      color: item.color,
      brand: item.brand,
    }));

    const deliveryDateStr = result.order.deliveryDate 
      ? new Date(result.order.deliveryDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      : null;

    const message = result.transitioned
      ? `✅ ${items.length} item(s) added. Order is now In Progress!${deliveryDateStr ? ` Delivery: ${deliveryDateStr}` : ''}`
      : `✅ ${items.length} item(s) added to order.`;

    return apiResponse.success(
      {
        items: responseItems,
        order: {
          id: result.order.id,
          orderNumber: result.order.orderNumber,
          status: result.order.status,
          priority: result.order.priority,
          totalAmount: parseFloat(result.order.totalAmount.toString()),
          tax: result.order.tax ? parseFloat(result.order.tax.toString()) : 0,
          itemCount: existingItemCount + items.length,
          deliveryDate: result.order.deliveryDate?.toISOString() || null,
        },
        transitioned: result.transitioned,
      },
      message
    );
  } catch (error) {
    console.error('Error adding items to order:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to add items to order');
  }
}

// ============================================================================
// GET /api/orders/[id]/items - Get order items (for add items modal)
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.notFound('Business not found');
    }

    const { id: orderId } = await params;

    const order = await prisma.order.findFirst({
      where: { id: orderId, businessId },
      include: {
        items: {
          include: {
            item: { select: { id: true, name: true, iconUrl: true, category: true } },
            treatment: { select: { id: true, name: true, code: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        customer: { select: { id: true, fullName: true, phone: true } },
        store: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      return apiResponse.notFound('Order not found');
    }

    const items = order.items.map(item => ({
      id: item.id,
      tagNumber: item.tagNumber,
      itemId: item.itemId,
      itemName: item.itemName,
      itemIcon: item.item?.iconUrl || null,
      itemCategory: item.item?.category || null,
      treatmentId: item.treatmentId,
      treatmentName: item.treatmentName,
      treatmentCode: item.treatment?.code || null,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice.toString()),
      subtotal: parseFloat(item.subtotal.toString()),
      status: item.status,
      isExpress: item.isExpress,
      notes: item.notes,
      color: item.color,
      brand: item.brand,
      sentToWorkshop: item.sentToWorkshop,
    }));

    return apiResponse.success({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        orderType: order.orderType,
        deliveryDate: order.deliveryDate?.toISOString() || null,
        customer: order.customer,
        store: order.store,
      },
      items,
      canAddItems: ['PICKUP', 'IN_PROGRESS'].includes(order.status),
      needsDeliveryDate: !order.deliveryDate,
    });
  } catch (error) {
    console.error('Error fetching order items:', error);
    return apiResponse.error('Failed to fetch order items');
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateTagNumber(orderNumber: string, itemIndex: number): string {
  const itemNumber = itemIndex.toString().padStart(3, '0');
  return `${orderNumber}-${itemNumber}`;
}