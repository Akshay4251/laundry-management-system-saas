// app/api/inventory/stats/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api/inventory/stats
 * Get inventory statistics
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('Business not found', 404);
    }

    const items = await prisma.inventoryItem.findMany({
      where: {
        businessId,
        deletedAt: null,
        isActive: true,
      },
      select: {
        category: true,
        currentStock: true,
        minStock: true,
        costPerUnit: true,
      },
    });

    const stats = {
      totalItems: items.length,
      totalValue: items.reduce(
        (sum, item) => sum + item.currentStock * parseFloat(item.costPerUnit.toString()),
        0
      ),
      lowStockCount: items.filter((item) => item.currentStock <= item.minStock && item.currentStock > 0).length,
      outOfStockCount: items.filter((item) => item.currentStock === 0).length,
      categoryCounts: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return successResponse({ stats });
  } catch (error) {
    console.error('Inventory stats error:', error);
    return errorResponse('Failed to fetch inventory stats', 500);
  }
}