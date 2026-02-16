// app/api/delivery-app/orders/stats/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverApiResponse, handleDriverCorsPreflightRequest } from '@/lib/driver-api-response';
import { authenticateDriver } from '@/lib/driver-auth';

export async function OPTIONS() {
  return handleDriverCorsPreflightRequest();
}

export async function GET(req: NextRequest) {
  try {
    const driver = await authenticateDriver(req);
    if (!driver) {
      return driverApiResponse.unauthorized();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingPickups, pendingDeliveries, completedToday, totalCompleted] = await Promise.all([
      prisma.order.count({
        where: {
          driverId: driver.id,
          businessId: driver.businessId,
          status: {
            in: ['PICKUP', 'IN_PROGRESS'],
          },
        },
      }),
      prisma.order.count({
        where: {
          driverId: driver.id,
          businessId: driver.businessId,
          status: {
            in: ['READY', 'OUT_FOR_DELIVERY'],
          },
        },
      }),
      prisma.order.count({
        where: {
          driverId: driver.id,
          businessId: driver.businessId,
          status: 'COMPLETED',
          completedDate: {
            gte: today,
          },
        },
      }),
      prisma.order.count({
        where: {
          driverId: driver.id,
          businessId: driver.businessId,
          status: 'COMPLETED',
        },
      }),
    ]);

    return driverApiResponse.success({
      pendingPickups,
      pendingDeliveries,
      completedToday,
      totalCompleted,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return driverApiResponse.error('Failed to fetch stats');
  }
}