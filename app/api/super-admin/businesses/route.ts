// app/api/super-admin/businesses/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Debug log
    console.log('Super Admin Businesses API - Session:', {
      user: session?.user?.email,
      isSuperAdmin: session?.user?.isSuperAdmin,
    });

    if (!session?.user?.isSuperAdmin) {
      console.log('Unauthorized: Not a super admin');
      return apiResponse.unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    console.log('Fetching businesses with where:', where);

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          settings: {
            select: {
              pickupEnabled: true,
              deliveryEnabled: true,
              workshopEnabled: true,
              multiStoreEnabled: true,
            },
          },
          _count: {
            select: {
              stores: true,
              customers: true,
              orders: true,
              staff: true,
            },
          },
        },
      }),
      prisma.business.count({ where }),
    ]);

    console.log('Found businesses:', businesses.length);

    return apiResponse.success({
      businesses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return apiResponse.error('Failed to fetch businesses');
  }
}