// app/api/super-admin/businesses/[id]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
        settings: true,
        _count: {
          select: {
            stores: true,
            customers: true,
            orders: true,
            staff: true,
          },
        },
      },
    });

    if (!business) {
      return apiResponse.notFound('Business not found');
    }

    return apiResponse.success(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    return apiResponse.error('Failed to fetch business');
  }
}