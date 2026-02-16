// app/api/business/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  handlePrismaError,
} from '@/lib/api-response';
import { Prisma } from '@prisma/client';

// ============================================================================
// GET /api/business - Get current user's business info
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    // 2. Super admin doesn't have a business
    if (session.user.isSuperAdmin) {
      return successResponse({
        id: 'super-admin',
        businessName: 'Super Admin',
        planType: 'ENTERPRISE',
        planStatus: 'ACTIVE',
      });
    }

    // 3. Get businessId
    const businessId = session.user.businessId;
    
    if (!businessId) {
      return errorResponse('No business associated with this account', 400);
    }

    // 4. Fetch business with settings
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
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
      return errorResponse('Business not found', 404);
    }

    return successResponse(business);
  } catch (error) {
    console.error('Error fetching business:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse('Failed to fetch business', 500);
  }
}