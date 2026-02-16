// app/api/delivery-app/orders/[id]/pickup/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverApiResponse, handleDriverCorsPreflightRequest } from '@/lib/driver-api-response';
import { authenticateDriver } from '@/lib/driver-auth';

export async function OPTIONS() {
  return handleDriverCorsPreflightRequest();
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

    const { id } = await params;

    // Only allow pickup of orders in PICKUP status
    const order = await prisma.order.findFirst({
      where: {
        id,
        driverId: driver.id,
        businessId: driver.businessId,
        status: 'PICKUP',
      },
    });

    if (!order) {
      return driverApiResponse.notFound('Order not found or already picked up');
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          pickedUpAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: 'PICKUP',
          toStatus: 'IN_PROGRESS',
          changedBy: `Driver: ${driver.fullName}`,
          notes: 'Picked up by driver',
        },
      });
    });

    return driverApiResponse.success({ id, status: 'IN_PROGRESS' }, 'Order picked up successfully');
  } catch (error) {
    console.error('Pickup order error:', error);
    return driverApiResponse.error('Failed to update order');
  }
}