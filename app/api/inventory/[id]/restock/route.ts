// app/api/inventory/[id]/restock/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { restockSchema } from '@/lib/validations/inventory';
import {
  successResponse,
  errorResponse,
  handleZodError,
  handlePrismaError,
} from '@/lib/api-response';
import { Prisma } from '@prisma/client';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/inventory/[id]/restock
 * Add stock to an inventory item
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;

    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('Business not found', 404);
    }

    // Verify item exists
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        id: params.id,
        businessId,
        deletedAt: null,
      },
    });

    if (!existingItem) {
      return errorResponse('Inventory item not found', 404);
    }

    const body = await req.json();
    const validationResult = restockSchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const data = validationResult.data;
    const costPerUnit = data.costPerUnit ?? parseFloat(existingItem.costPerUnit.toString());
    const newStock = existingItem.currentStock + data.addedStock;

    // Get the user's name for tracking
    const userName = session.user.name || 'Unknown User';

    // Update item and create log in transaction
    const [updatedItem] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: params.id },
        data: {
          currentStock: newStock,
          costPerUnit: data.costPerUnit ?? existingItem.costPerUnit,
          lastRestockedAt: new Date(),
          lastRestockedBy: userName,
        },
      }),
      prisma.inventoryRestockLog.create({
        data: {
          inventoryItemId: params.id,
          previousStock: existingItem.currentStock,
          addedStock: data.addedStock,
          newStock,
          costPerUnit,
          totalCost: data.addedStock * costPerUnit,
          notes: data.notes,
          restockedBy: userName,
        },
      }),
    ]);

    const updatedCostPerUnit = parseFloat(updatedItem.costPerUnit.toString());

    const transformedItem = {
      ...updatedItem,
      costPerUnit: updatedCostPerUnit,
      totalValue: updatedItem.currentStock * updatedCostPerUnit,
      isLowStock: updatedItem.currentStock <= updatedItem.minStock,
      stockPercentage: updatedItem.minStock > 0 
        ? Math.min((updatedItem.currentStock / updatedItem.minStock) * 100, 100)
        : 100,
      createdAt: updatedItem.createdAt.toISOString(),
      updatedAt: updatedItem.updatedAt.toISOString(),
      lastRestockedAt: updatedItem.lastRestockedAt?.toISOString() || null,
      deletedAt: updatedItem.deletedAt?.toISOString() || null,
    };

    return successResponse(
      { item: transformedItem },
      `Added ${data.addedStock} ${existingItem.unit} to stock`
    );
  } catch (error) {
    console.error('Restock error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse('Failed to restock item', 500);
  }
}