// app/api/items/[id]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse, handlePrismaError } from '@/lib/api-response';
import { Prisma } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET /api/items/[id] - Get single item with all prices
// ============================================================================
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    const { id } = await params;

    const item = await prisma.item.findFirst({
      where: { id, businessId, deletedAt: null },
      include: {
        prices: {
          include: {
            treatment: {
              select: { id: true, name: true, code: true, turnaroundHours: true },
            },
          },
        },
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!item) {
      return apiResponse.notFound('Item not found');
    }

    // Get all treatments to show full pricing matrix
    const allTreatments = await prisma.treatment.findMany({
      where: { businessId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return apiResponse.success({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      iconUrl: item.iconUrl,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      usageCount: item._count.orderItems,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      prices: allTreatments.map((treatment) => {
        const priceEntry = item.prices.find((p) => p.treatmentId === treatment.id);
        return {
          treatmentId: treatment.id,
          treatmentName: treatment.name,
          treatmentCode: treatment.code,
          turnaroundHours: treatment.turnaroundHours,
          price: priceEntry ? parseFloat(priceEntry.price.toString()) : null,
          expressPrice: priceEntry?.expressPrice
            ? parseFloat(priceEntry.expressPrice.toString())
            : null,
          isAvailable: priceEntry?.isAvailable ?? false,
        };
      }),
    });
  } catch (error) {
    console.error('GET /api/items/[id] error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to fetch item');
  }
}

// ============================================================================
// PATCH /api/items/[id] - Update item with prices
// ============================================================================
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    const { id } = await params;
    const body = await req.json();

    const { name, description, category, iconUrl, isActive, sortOrder, prices } = body;

    // Verify item exists
    const existingItem = await prisma.item.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existingItem) {
      return apiResponse.notFound('Item not found');
    }

    // Check for duplicate name (if name is being changed)
    if (name && name.trim().toLowerCase() !== existingItem.name.toLowerCase()) {
      const duplicate = await prisma.item.findFirst({
        where: {
          businessId,
          name: { equals: name.trim(), mode: 'insensitive' },
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicate) {
        return apiResponse.conflict('An item with this name already exists');
      }
    }

    // Update item with prices in transaction
    const updatedItem = await prisma.$transaction(async (tx) => {
      const item = await tx.item.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(category && { category }),
          ...(iconUrl !== undefined && { iconUrl: iconUrl || null }),
          ...(isActive !== undefined && { isActive }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      });

      // Update prices if provided
      if (prices && Array.isArray(prices)) {
        for (const p of prices) {
          if (p.price === null || p.price === undefined) {
            await tx.itemTreatmentPrice.deleteMany({
              where: { businessId, itemId: id, treatmentId: p.treatmentId },
            });
          } else {
            await tx.itemTreatmentPrice.upsert({
              where: {
                businessId_itemId_treatmentId: {
                  businessId,
                  itemId: id,
                  treatmentId: p.treatmentId,
                },
              },
              update: {
                price: p.price,
                expressPrice: p.expressPrice || null,
                isAvailable: p.isAvailable ?? true,
              },
              create: {
                businessId,
                itemId: id,
                treatmentId: p.treatmentId,
                price: p.price,
                expressPrice: p.expressPrice || null,
                isAvailable: p.isAvailable ?? true,
              },
            });
          }
        }
      }

      return item;
    });

    return apiResponse.success(
      { id: updatedItem.id, name: updatedItem.name },
      'Item updated successfully'
    );
  } catch (error) {
    console.error('PATCH /api/items/[id] error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to update item');
  }
}

// ============================================================================
// DELETE /api/items/[id] - Soft delete item
// ============================================================================
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    const { id } = await params;

    const existingItem = await prisma.item.findFirst({
      where: { id, businessId, deletedAt: null },
      include: {
        _count: { select: { orderItems: true } },
      },
    });

    if (!existingItem) {
      return apiResponse.notFound('Item not found');
    }

    if (existingItem._count.orderItems > 0) {
      await prisma.item.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      });

      return apiResponse.success(
        { id },
        `Item archived (used in ${existingItem._count.orderItems} orders)`
      );
    }

    await prisma.$transaction([
      prisma.itemTreatmentPrice.deleteMany({ where: { itemId: id } }),
      prisma.item.delete({ where: { id } }),
    ]);

    return apiResponse.success({ id }, 'Item deleted successfully');
  } catch (error) {
    console.error('DELETE /api/items/[id] error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to delete item');
  }
}