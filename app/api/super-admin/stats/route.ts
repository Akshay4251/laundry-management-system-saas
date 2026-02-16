// app/api/super-admin/stats/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isSuperAdmin) return apiResponse.unauthorized();

    const [
      totalBusinesses,
      activeBusinesses,
      trialBusinesses,
      suspendedBusinesses,
      totalUsers,
      ownerCount,
      adminCount,
      staffCount,
      totalOrders,
      ordersThisMonth,
      planDistribution,
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { planStatus: 'ACTIVE' } }),
      prisma.business.count({ where: { planStatus: 'TRIAL' } }),
      prisma.business.count({ where: { planStatus: 'SUSPENDED' } }),
      prisma.user.count({ where: { businessId: { not: null } } }),
      prisma.user.count({ where: { role: 'OWNER', businessId: { not: null } } }),
      prisma.user.count({ where: { role: 'ADMIN', businessId: { not: null } } }),
      prisma.user.count({ where: { role: 'STAFF', businessId: { not: null } } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      prisma.business.groupBy({ by: ['planType'], _count: { id: true } }),
    ]);

    const planDist = { trial: 0, basic: 0, professional: 0, enterprise: 0 };
    planDistribution.forEach((item) => {
      const key = item.planType.toLowerCase() as keyof typeof planDist;
      if (key in planDist) planDist[key] = item._count.id;
    });

    return apiResponse.success({
      businesses: { total: totalBusinesses, active: activeBusinesses, trial: trialBusinesses, suspended: suspendedBusinesses },
      users: { total: totalUsers, owners: ownerCount, admins: adminCount, staff: staffCount },
      orders: { total: totalOrders, thisMonth: ordersThisMonth },
      planDistribution: planDist,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return apiResponse.error('Failed to fetch stats');
  }
}