// app/api/customer-app/orders/[id]/reorder/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';

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
    if (addressId) {
      const address = await prisma.customerAddress.findFirst({
        where: { id: addressId, customerId: customer.id },
      });
      if (address) {
        pickupAddress = `${address.fullAddress}${address.landmark ? ', ' + address.landmark : ''}, ${address.city} - ${address.pincode}`;
      }
    }

    // Create items summary
    const itemsSummary = originalOrder.items
      .map((item) => `${item.quantity}x ${item.itemName}${item.treatmentName ? ` (${item.treatmentName})` : ''}`)
      .join(', ');

    // Generate new order number
    const orderNumber = await generateOrderNumber(customer.businessId, originalOrder.storeId);

    // Create new pickup order
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

    return customerApiResponse.success({
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        pickupDate: newOrder.pickupDate?.toISOString(),
      },
    }, 'Pickup scheduled successfully based on previous order!');
  } catch (error) {
    console.error('Reorder error:', error);
    return customerApiResponse.error('Failed to create reorder');
  }
}

// Helper function
async function generateOrderNumber(businessId: string, storeId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { name: true },
  });

  const storeCode = store?.name
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'STR';

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const todayOrderCount = await prisma.order.count({
    where: {
      businessId,
      storeId,
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  const sequenceNumber = (todayOrderCount + 1).toString().padStart(4, '0');
  return `${storeCode}-${year}${month}${day}-${sequenceNumber}`;
}