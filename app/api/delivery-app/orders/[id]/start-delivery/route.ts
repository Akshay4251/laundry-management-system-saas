// app/api/delivery-app/orders/[id]/start-delivery/route.ts

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

    const order = await prisma.order.findFirst({
      where: {
        id,
        driverId: driver.id,
        businessId: driver.businessId,
        status: 'READY',
      },
    });

    if (!order) {
      return driverApiResponse.notFound('Order not found or not ready for delivery');
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'OUT_FOR_DELIVERY',
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        fromStatus: 'READY',
        toStatus: 'OUT_FOR_DELIVERY',
        changedBy: driver.fullName,
        notes: 'Out for delivery',
      },
    });

    return driverApiResponse.success(updatedOrder, 'Delivery started');
  } catch (error) {
    console.error('Start delivery error:', error);
    return driverApiResponse.error('Failed to start delivery');
  }
}