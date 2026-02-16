// app/api/delivery-app/orders/[id]/deliver/route.ts

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
        status: {
          in: ['READY', 'OUT_FOR_DELIVERY'],
        },
      },
    });

    if (!order) {
      return driverApiResponse.notFound('Order not found or cannot be delivered');
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        deliveredAt: new Date(),
        completedDate: new Date(),
      },
      include: {
        customer: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },
    });

    // Add to status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        fromStatus: order.status,
        toStatus: 'COMPLETED',
        changedBy: driver.fullName,
        notes: 'Delivered by driver',
      },
    });

    return driverApiResponse.success(updatedOrder, 'Order delivered successfully');
  } catch (error) {
    console.error('Deliver order error:', error);
    return driverApiResponse.error('Failed to update order');
  }
}