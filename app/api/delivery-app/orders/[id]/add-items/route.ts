// app/api/delivery-app/orders/[id]/add-items/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverApiResponse, handleDriverCorsPreflightRequest } from '@/lib/driver-api-response';
import { authenticateDriver } from '@/lib/driver-auth';

export async function OPTIONS() {
  return handleDriverCorsPreflightRequest();
}

interface AddItemInput {
  itemId: string;
  treatmentId: string;
  quantity: number;
  unitPrice: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const driver = await authenticateDriver(req);
    if (!driver) {
      return driverApiResponse.unauthorized();
    }

    const { id: orderId } = await params;
    const body = await req.json();
    const { items, markAsPickedUp = true } = body as {
      items: AddItemInput[];
      markAsPickedUp?: boolean;
    };

    if (!items || items.length === 0) {
      return driverApiResponse.error('At least one item is required');
    }

    // Fetch order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        driverId: driver.id,
        businessId: driver.businessId,
        status: 'PICKUP',
      },
      include: { items: true },
    });

    if (!order) {
      return driverApiResponse.notFound('Order not found or not in PICKUP status');
    }

    // Validate items and treatments
    const itemIds = [...new Set(items.map((i) => i.itemId))];
    const treatmentIds = [...new Set(items.map((i) => i.treatmentId))];

    const [dbItems, dbTreatments, businessSettings] = await Promise.all([
      prisma.item.findMany({
        where: { id: { in: itemIds }, businessId: driver.businessId, isActive: true, deletedAt: null },
      }),
      prisma.treatment.findMany({
        where: { id: { in: treatmentIds }, businessId: driver.businessId, isActive: true },
      }),
      prisma.businessSettings.findUnique({
        where: { businessId: driver.businessId },
      }),
    ]);

    const itemMap = new Map(dbItems.map((i) => [i.id, i]));
    const treatmentMap = new Map(dbTreatments.map((t) => [t.id, t]));

    for (const item of items) {
      if (!itemMap.has(item.itemId)) {
        return driverApiResponse.error(`Item not found: ${item.itemId}`);
      }
      if (!treatmentMap.has(item.treatmentId)) {
        return driverApiResponse.error(`Treatment not found: ${item.treatmentId}`);
      }
      if (item.quantity < 1) {
        return driverApiResponse.error('Quantity must be at least 1');
      }
    }

    // Calculate
    const isExpress = order.priority === 'EXPRESS';
    const expressMultiplier = businessSettings?.expressMultiplier
      ? parseFloat(businessSettings.expressMultiplier.toString())
      : 1.5;

    let newItemsSubtotal = 0;
    items.forEach((item) => {
      const price = isExpress ? Math.round(item.unitPrice * expressMultiplier) : item.unitPrice;
      newItemsSubtotal += price * item.quantity;
    });

    const existingSubtotal = order.items.reduce(
      (sum, item) => sum + parseFloat(item.subtotal.toString()),
      0
    );
    const totalSubtotal = existingSubtotal + newItemsSubtotal;

    // GST calculation
    const gstEnabled = businessSettings?.gstEnabled ?? false;
    const gstPercentage = gstEnabled
      ? parseFloat((businessSettings?.gstPercentage ?? 18).toString())
      : 0;
    const existingDiscount = order.discount ? parseFloat(order.discount.toString()) : 0;
    const taxableAmount = totalSubtotal - existingDiscount;
    const gstAmount = gstEnabled ? Math.round(taxableAmount * (gstPercentage / 100)) : 0;
    const newTotal = taxableAmount + gstAmount;

    const existingItemCount = order.items.length;

    // Auto-calculate delivery date if not set
    let deliveryDate = order.deliveryDate;
    if (!deliveryDate) {
      const d = new Date();
      d.setDate(d.getDate() + (isExpress ? 1 : 2));
      d.setHours(17, 0, 0, 0);
      deliveryDate = d;
    }

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdItems = await Promise.all(
        items.map(async (item, index) => {
          const dbItem = itemMap.get(item.itemId)!;
          const dbTreatment = treatmentMap.get(item.treatmentId)!;
          const tagNumber = `${order.orderNumber}-${(existingItemCount + index + 1).toString().padStart(3, '0')}`;
          const price = isExpress ? Math.round(item.unitPrice * expressMultiplier) : item.unitPrice;

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
              status: 'RECEIVED',
              unitPrice: item.unitPrice,
              subtotal: price * item.quantity,
              isExpress,
            },
          });
        })
      );

      const shouldTransition = markAsPickedUp;

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          ...(shouldTransition && { status: 'IN_PROGRESS', pickedUpAt: new Date() }),
          totalAmount: newTotal,
          subtotal: totalSubtotal,
          ...(gstEnabled && { gstEnabled: true, gstPercentage, gstAmount }),
          ...(!gstEnabled && { tax: 0 }),
          ...(!order.deliveryDate && { deliveryDate }),
        },
      });

      if (shouldTransition) {
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: 'PICKUP',
            toStatus: 'IN_PROGRESS',
            changedBy: `Driver: ${driver.fullName}`,
            notes: `Picked up by driver. ${items.length} item(s) received.`,
          },
        });
      }

      // Update customer analytics on first items addition
      if (existingItemCount === 0 && shouldTransition) {
        await tx.customer.update({
          where: { id: order.customerId },
          data: {
            lastOrderDate: new Date(),
            totalSpent: { increment: newTotal },
          },
        });
      }

      return { items: createdItems, order: updatedOrder, transitioned: shouldTransition };
    });

    return driverApiResponse.success(
      {
        itemsAdded: result.items.length,
        orderId: result.order.id,
        status: result.order.status,
        totalAmount: parseFloat(result.order.totalAmount.toString()),
        transitioned: result.transitioned,
      },
      `${items.length} item(s) added${result.transitioned ? ' & order picked up' : ''} successfully`
    );
  } catch (error) {
    console.error('Add items error:', error);
    return driverApiResponse.error('Failed to add items');
  }
}