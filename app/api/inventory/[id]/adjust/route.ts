// app/api/inventory/[id]/adjust/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stockAdjustmentSchema } from '@/lib/validations/inventory';
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
 * POST /api/inventory/[id]/adjust
 * Adjust stock (add or remove) with reason tracking
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

    // Get existing item
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
    const validationResult = stockAdjustmentSchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const { type, quantity, reason, notes, costPerUnit } = validationResult.data;

    // Calculate new stock
    const previousStock = existingItem.currentStock;
    let newStock: number;

    if (type === 'ADD') {
      newStock = previousStock + quantity;
    } else {
      newStock = previousStock - quantity;
      
      // Prevent negative stock
      if (newStock < 0) {
        return errorResponse(
          `Cannot remove ${quantity} units. Only ${previousStock} units available.`,
          400
        );
      }
    }

    // Update inventory and create adjustment log in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update inventory item
      const updatedItem = await tx.inventoryItem.update({
        where: { id: params.id },
        data: {
          currentStock: newStock,
          ...(type === 'ADD' && { lastRestockedAt: new Date() }),
          ...(costPerUnit !== undefined && { costPerUnit }),
        },
      });

      // Create restock log for tracking (using correct model name)
      await tx.inventoryRestockLog.create({
        data: {
          inventoryItemId: params.id,
          previousStock,
          addedStock: type === 'ADD' ? quantity : -quantity, // Negative for removals
          newStock,
          costPerUnit: costPerUnit ?? existingItem.costPerUnit,
          totalCost: new Prisma.Decimal(
            (costPerUnit ?? parseFloat(existingItem.costPerUnit.toString())) * quantity
          ),
          notes: `[${type}] ${reason}${notes ? `: ${notes}` : ''}`,
          restockedBy: session.user.id,
        },
      });

      return updatedItem;
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 🔔 CREATE NOTIFICATIONS FOR STOCK CHANGES
    // ═══════════════════════════════════════════════════════════════════════

    try {
      // Low stock notification
      const wasNotLowStock = previousStock > existingItem.minStock;
      const isNowLowStock = newStock <= existingItem.minStock && newStock > 0;

      if (wasNotLowStock && isNowLowStock) {
        await createNotificationForBusiness({
          businessId,
          type: 'LOW_STOCK',
          title: 'Low Stock Alert',
          message: `${result.name} is running low with only ${newStock} ${result.unit} remaining. Minimum stock level is ${result.minStock}.`,
          data: {
            itemId: result.id,
            itemName: result.name,
            currentStock: newStock,
            minStock: result.minStock,
            unit: result.unit,
            supplier: result.supplier,
            adjustmentType: type,
            adjustmentReason: reason,
          },
        });
      }

      // Out of stock notification
      if (previousStock > 0 && newStock === 0) {
        await createNotificationForBusiness({
          businessId,
          type: 'LOW_STOCK',
          title: 'Out of Stock',
          message: `${result.name} is now out of stock. Please reorder immediately from ${result.supplier || 'your supplier'}.`,
          data: {
            itemId: result.id,
            itemName: result.name,
            currentStock: 0,
            minStock: result.minStock,
            supplier: result.supplier,
            supplierPhone: result.supplierPhone,
          },
        });
      }

      // Stock replenished notification (was low/out, now okay)
      const wasLowOrOut = previousStock <= existingItem.minStock;
      const isNowOkay = newStock > existingItem.minStock;

      if (wasLowOrOut && isNowOkay && type === 'ADD') {
        await createNotificationForBusiness({
          businessId,
          type: 'SYSTEM',
          title: 'Stock Replenished',
          message: `${result.name} has been restocked to ${newStock} ${result.unit}. Stock levels are now healthy.`,
          data: {
            itemId: result.id,
            itemName: result.name,
            currentStock: newStock,
            minStock: result.minStock,
            addedQuantity: quantity,
          },
        });
      }
    } catch (notifError) {
      console.error('Failed to create inventory notification:', notifError);
      // Don't fail the adjustment if notification fails
    }

    // Transform response
    const itemCostPerUnit = parseFloat(result.costPerUnit.toString());
    const transformedItem = {
      ...result,
      costPerUnit: itemCostPerUnit,
      totalValue: result.currentStock * itemCostPerUnit,
      isLowStock: result.currentStock <= result.minStock,
      stockPercentage: result.minStock > 0
        ? Math.min((result.currentStock / result.minStock) * 100, 100)
        : 100,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      lastRestockedAt: result.lastRestockedAt?.toISOString() || null,
      deletedAt: result.deletedAt?.toISOString() || null,
    };

    const actionMessage = type === 'ADD' 
      ? `Added ${quantity} ${result.unit}` 
      : `Removed ${quantity} ${result.unit}`;

    return successResponse(
      { 
        item: transformedItem,
        adjustment: {
          type,
          quantity,
          reason,
          previousStock,
          newStock,
        }
      },
      `Stock adjusted successfully. ${actionMessage}. New stock: ${newStock} ${result.unit}`
    );
  } catch (error) {
    console.error('Stock adjustment error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse('Failed to adjust stock', 500);
  }
}