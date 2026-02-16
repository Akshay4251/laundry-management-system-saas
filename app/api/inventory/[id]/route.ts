// app/api/inventory/[id]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateInventorySchema } from '@/lib/validations/inventory';
import {
  successResponse,
  errorResponse,
  handleZodError,
  handlePrismaError,
} from '@/lib/api-response';
import { Prisma } from '@prisma/client';
import { createNotificationForBusiness } from '@/lib/notifications/create-notification';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/inventory/[id]
 * Get a single inventory item with restock history
 */
export async function GET(req: NextRequest, context: RouteContext) {
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

    const item = await prisma.inventoryItem.findFirst({
      where: {
        id: params.id,
        businessId,
      },
      include: {
        restockHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!item) {
      return errorResponse('Inventory item not found', 404);
    }

    const costPerUnit = parseFloat(item.costPerUnit.toString());

    const transformedItem = {
      ...item,
      costPerUnit,
      totalValue: item.currentStock * costPerUnit,
      isLowStock: item.currentStock <= item.minStock,
      stockPercentage: item.minStock > 0 
        ? Math.min((item.currentStock / item.minStock) * 100, 100)
        : 100,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      lastRestockedAt: item.lastRestockedAt?.toISOString() || null,
      deletedAt: item.deletedAt?.toISOString() || null,
      restockHistory: item.restockHistory.map((log) => ({
        ...log,
        costPerUnit: parseFloat(log.costPerUnit.toString()),
        totalCost: parseFloat(log.totalCost.toString()),
        createdAt: log.createdAt.toISOString(),
      })),
    };

    return successResponse({ item: transformedItem });
  } catch (error) {
    console.error('Inventory fetch error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse('Failed to fetch inventory item', 500);
  }
}

/**
 * PATCH /api/inventory/[id]
 * Update inventory item details
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
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
    const validationResult = updateInventorySchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const data = validationResult.data;

    // Check for duplicate SKU if updating
    if (data.sku && data.sku !== existingItem.sku) {
      const duplicateSku = await prisma.inventoryItem.findFirst({
        where: {
          businessId,
          sku: data.sku,
          id: { not: params.id },
          deletedAt: null,
        },
      });

      if (duplicateSku) {
        return errorResponse('An item with this SKU already exists', 409);
      }
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.category && { category: data.category }),
        ...(data.minStock !== undefined && { minStock: data.minStock }),
        ...(data.maxStock !== undefined && { maxStock: data.maxStock }),
        ...(data.unit && { unit: data.unit }),
        ...(data.costPerUnit !== undefined && { costPerUnit: data.costPerUnit }),
        ...(data.supplier !== undefined && { supplier: data.supplier }),
        ...(data.supplierPhone !== undefined && { supplierPhone: data.supplierPhone }),
        ...(data.supplierEmail !== undefined && { supplierEmail: data.supplierEmail || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 🔔 CHECK FOR LOW STOCK AND CREATE NOTIFICATION
    // ═══════════════════════════════════════════════════════════════════════

    try {
      const wasNotLowStock = existingItem.currentStock > existingItem.minStock;
      const isNowLowStock = updatedItem.currentStock <= updatedItem.minStock;

      // Only notify if stock just became low (prevent spam)
      if (wasNotLowStock && isNowLowStock && updatedItem.currentStock > 0) {
        await createNotificationForBusiness({
          businessId,
          type: 'LOW_STOCK',
          title: '⚠️ Low stock alert',
          message: `${updatedItem.name} is running low (${updatedItem.currentStock} ${updatedItem.unit} remaining)`,
          data: {
            itemId: updatedItem.id,
            itemName: updatedItem.name,
            currentStock: updatedItem.currentStock,
            minStock: updatedItem.minStock,
            unit: updatedItem.unit,
            supplier: updatedItem.supplier,
          },
        });
      }

      // Out of stock notification
      if (existingItem.currentStock > 0 && updatedItem.currentStock === 0) {
        await createNotificationForBusiness({
          businessId,
          type: 'LOW_STOCK',
          title: '🚨 Out of stock',
          message: `${updatedItem.name} is out of stock - please reorder immediately`,
          data: {
            itemId: updatedItem.id,
            itemName: updatedItem.name,
            currentStock: 0,
            minStock: updatedItem.minStock,
            supplier: updatedItem.supplier,
            supplierPhone: updatedItem.supplierPhone,
          },
        });
      }
    } catch (notifError) {
      console.error('Failed to create inventory notification:', notifError);
      // Don't fail the update if notification fails
    }

    const costPerUnit = parseFloat(updatedItem.costPerUnit.toString());

    const transformedItem = {
      ...updatedItem,
      costPerUnit,
      totalValue: updatedItem.currentStock * costPerUnit,
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
      'Inventory item updated successfully'
    );
  } catch (error) {
    console.error('Inventory update error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse('Failed to update inventory item', 500);
  }
}

/**
 * DELETE /api/inventory/[id]
 * Soft delete an inventory item
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
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

    // Soft delete
    await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return successResponse(
      { id: params.id },
      'Inventory item deleted successfully'
    );
  } catch (error) {
    console.error('Inventory deletion error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse('Failed to delete inventory item', 500);
  }
}