// app/api/orders/stats/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { OrderStatus } from '@prisma/client';

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
    const storeId = searchParams.get('storeId');

    const where = {
      businessId,
      ...(storeId && { storeId }),
    };

    // Get counts for each status
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    // Get workshop items count
    const workshopItemsCount = await prisma.orderItem.count({
      where: {
        order: { businessId, ...(storeId && { storeId }) },
        sentToWorkshop: true,
        status: 'AT_WORKSHOP',  // ✅ FIXED: Use Prisma enum
      },
    });

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await prisma.order.aggregate({
      where: {
        ...where,
        createdAt: { gte: today, lt: tomorrow },
      },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    // ✅ FIXED: Use Prisma enum names
    const counts: Record<string, number> = {
      PICKUP: 0,
      IN_PROGRESS: 0,        // ✅ Correct Prisma enum
      AT_WORKSHOP: 0,        // ✅ Correct Prisma enum
      WORKSHOP_RETURNED: 0,  // ✅ Added missing status
      READY: 0,
      OUT_FOR_DELIVERY: 0,   // ✅ Correct Prisma enum
      COMPLETED: 0,          // ✅ Correct Prisma enum
      CANCELLED: 0,
    };

    statusCounts.forEach((item) => {
      counts[item.status] = item._count.status;
    });

    // Calculate active orders total (excluding completed and cancelled)
    const total = Object.entries(counts)
      .filter(([key]) => !['COMPLETED', 'CANCELLED'].includes(key))
      .reduce((sum, [, count]) => sum + count, 0);

    return apiResponse.success({
      statusCounts: {
        ...counts,
        total,
      },
      workshopItems: workshopItemsCount,
      today: {
        orders: todayStats._count.id,
        revenue: todayStats._sum.totalAmount 
          ? parseFloat(todayStats._sum.totalAmount.toString()) 
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return apiResponse.error('Failed to fetch order stats');
  }
}