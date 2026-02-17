// app/api/customer-app/orders/[id]/reorder/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';
import { generateOrderNumber, createOrderWithRetry } from '@/lib/order-utils';

// ============================================================================
// POST /api/customer-app/orders/[id]/reorder - Create new pickup based on previous order
// ============================================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const { id } = await params;
    const body = await req.json();
    const { pickupDate, pickupTimeSlot, addressId } = body;

    if (!pickupDate || !pickupTimeSlot) {
      return customerApiResponse.badRequest('Pickup date and time slot are required');
    }

    // Get original order
    const originalOrder = await prisma.order.findFirst({
      where: {
        id,
        customerId: customer.id,
        businessId: customer.businessId,
      },
      include: {
        store: true,
        items: {
          select: {
            itemName: true,
            treatmentName: true,
            quantity: true,
          },
        },
      },
    });

    if (!originalOrder) {
      return customerApiResponse.notFound('Original order not found');
    }

    // Get address if provided
    let pickupAddress = null;
    let validAddressId: string | null = null;

    if (addressId) {
      const address = await prisma.customerAddress.findFirst({
        where: { id: addressId, customerId: customer.id },
      });
      if (address) {
        validAddressId = address.id;
        pickupAddress = `${address.fullAddress}${address.landmark ? ', ' + address.landmark : ''}, ${address.city} - ${address.pincode}`;
      }
    }

    // Create items summary
    const itemsSummary = originalOrder.items
      .map((item) => `${item.quantity}x ${item.itemName}${item.treatmentName ? ` (${item.treatmentName})` : ''}`)
      .join(', ');

    // ═══════════════════════════════════════════════════════════════════════
    // CREATE ORDER WITH RETRY (shared logic handles collisions with all sources)
    // ═══════════════════════════════════════════════════════════════════════

    const result = await createOrderWithRetry(async () => {
      const orderNumber = await generateOrderNumber(customer.businessId, originalOrder.storeId);

      const newOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            businessId: customer.businessId,
            storeId: originalOrder.storeId,
            customerId: customer.id,
            orderNumber,
            orderType: 'PICKUP',
            status: 'PICKUP',
            priority: 'NORMAL',
            subtotal: 0,
            totalAmount: 0,
            paidAmount: 0,
            paymentStatus: 'UNPAID',
            pickupDate: new Date(pickupDate),
            addressId: validAddressId,
            specialInstructions: [
              pickupAddress ? `Pickup Address: ${pickupAddress}` : null,
              `Pickup Time: ${pickupTimeSlot}`,
              `Reorder from #${originalOrder.orderNumber}`,
              `Previous items: ${itemsSummary}`,
            ].filter(Boolean).join('\n'),
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            toStatus: 'PICKUP',
            changedBy: 'customer-app',
            notes: `Reorder from #${originalOrder.orderNumber} via customer app`,
          },
        });

        return order;
      });

      return { order: newOrder, orderNumber };
    });

    if (!result.success) {
      return customerApiResponse.error(result.error);
    }

    const { order } = result.data;

    return customerApiResponse.success({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        pickupDate: order.pickupDate?.toISOString(),
      },
    }, 'Pickup scheduled successfully based on previous order!');
  } catch (error) {
    console.error('Reorder error:', error);
    return customerApiResponse.error('Failed to create reorder');
  }
}