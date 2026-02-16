// app/api/stores/route.ts
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
// GET /api/stores - List Stores for current user's business
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    // 2. Super admin sees all stores (optional - or you can restrict)
    if (session.user.isSuperAdmin) {
      const allStores = await prisma.store.findMany({
        where: { isActive: true },
        include: {
          business: {
            select: {
              id: true,
              businessName: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return successResponse(allStores);
    }

    // 3. Regular users - check businessId
    const businessId = session.user.businessId;
    
    if (!businessId) {
      return errorResponse('No business associated with this account', 400);
    }

    // 4. Fetch stores for this business
    const stores = await prisma.store.findMany({
      where: {
        businessId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse('Failed to fetch stores', 500);
  }
}

// ============================================================================
// POST /api/stores - Create a new store
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    // 2. Only OWNER or ADMIN can create stores
    if (!['OWNER', 'ADMIN'].includes(session.user.role) && !session.user.isSuperAdmin) {
      return errorResponse('Permission denied', 403);
    }

    const businessId = session.user.businessId;
    
    if (!businessId && !session.user.isSuperAdmin) {
      return errorResponse('No business associated with this account', 400);
    }

    // 3. Parse request body
    const body = await req.json();
    const { name, address, phone } = body;

    if (!name || name.trim().length < 2) {
      return errorResponse('Store name is required (min 2 characters)', 400);
    }

    // 4. Check store limit (based on business settings)
    const settings = await prisma.businessSettings.findUnique({
      where: { businessId: businessId! },
    });

    const currentStoreCount = await prisma.store.count({
      where: { businessId: businessId! },
    });

    if (settings && currentStoreCount >= settings.maxStores) {
      return errorResponse(
        `Store limit reached (${settings.maxStores}). Upgrade your plan to add more stores.`,
        403
      );
    }

    // 5. Create the store
    const store = await prisma.store.create({
      data: {
        businessId: businessId!,
        name: name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        isActive: true,
      },
    });

    return successResponse(store, 'Store created successfully', 201);
  } catch (error) {
    console.error('Error creating store:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse('Failed to create store', 500);
  }
}