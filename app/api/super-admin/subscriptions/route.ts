// app/api/super-admin/subscriptions/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isSuperAdmin) return apiResponse.unauthorized();

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (plan && plan !== 'all') where.planType = plan;
    if (status && status !== 'all') where.planStatus = status;

    const [subscriptions, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          businessName: true,
          planType: true,
          planStatus: true,
          trialEndsAt: true,
          subscriptionEndsAt: true,
          createdAt: true,
          user: { select: { email: true, fullName: true } },
          _count: { select: { orders: true, stores: true } },
        },
      }),
      prisma.business.count({ where }),
    ]);

    return apiResponse.success({ subscriptions, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Subscriptions error:', error);
    return apiResponse.error('Failed to fetch subscriptions');
  }
}