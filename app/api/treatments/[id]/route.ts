// app/api/treatments/[id]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { updateTreatmentSchema } from '@/lib/validations/treatment';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET /api/treatments/[id] - Get single treatment
// ============================================================================
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const businessId = session.user.businessId;

    const treatment = await prisma.treatment.findFirst({
      where: { id, businessId },
      include: {
        prices: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                category: true,
                iconUrl: true,
              },
            },
          },
          orderBy: {
            item: { name: 'asc' },
          },
        },
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!treatment) {
      return apiResponse.notFound('Treatment not found');
    }

    // Transform prices
    const itemPrices = treatment.prices.map((p) => ({
      itemId: p.item.id,
      itemName: p.item.name,
      itemCategory: p.item.category,
      itemIconUrl: p.item.iconUrl,
      price: parseFloat(p.price.toString()),
      expressPrice: p.expressPrice ? parseFloat(p.expressPrice.toString()) : null,
      isAvailable: p.isAvailable,
    }));

    return apiResponse.success({
      id: treatment.id,
      name: treatment.name,
      code: treatment.code,
      description: treatment.description,
      iconUrl: treatment.iconUrl,
      isCombo: treatment.isCombo,
      turnaroundHours: treatment.turnaroundHours,
      isActive: treatment.isActive,
      sortOrder: treatment.sortOrder,
      createdAt: treatment.createdAt,
      updatedAt: treatment.updatedAt,
      itemPrices,
      usageCount: treatment._count.orderItems,
    });
  } catch (error) {
    console.error('GET /api/treatments/[id] error:', error);
    return apiResponse.error('Failed to fetch treatment');
  }
}

// ============================================================================
// PATCH /api/treatments/[id] - Update treatment
// ============================================================================
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const businessId = session.user.businessId;
    const body = await req.json();

    // Check if treatment exists
    const existingTreatment = await prisma.treatment.findFirst({
      where: { id, businessId },
    });

    if (!existingTreatment) {
      return apiResponse.notFound('Treatment not found');
    }

    // Validate input
    const validationResult = updateTreatmentSchema.safeParse(body);
    if (!validationResult.success) {
      return apiResponse.badRequest(
        'Validation failed',
        validationResult.error.flatten().fieldErrors
      );
    }

    const data = validationResult.data;

    // Check for duplicate code if code is being changed
    if (data.code && data.code !== existingTreatment.code) {
      const duplicateTreatment = await prisma.treatment.findFirst({
        where: {
          businessId,
          code: data.code,
          id: { not: id },
        },
      });

      if (duplicateTreatment) {
        return apiResponse.badRequest('A treatment with this code already exists');
      }
    }

    // Update treatment
    const treatment = await prisma.treatment.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.iconUrl !== undefined && { iconUrl: data.iconUrl }),
        ...(data.isCombo !== undefined && { isCombo: data.isCombo }),
        ...(data.turnaroundHours !== undefined && { turnaroundHours: data.turnaroundHours }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });

    return apiResponse.success(
      {
        id: treatment.id,
        name: treatment.name,
        code: treatment.code,
        description: treatment.description,
        iconUrl: treatment.iconUrl,
        isCombo: treatment.isCombo,
        turnaroundHours: treatment.turnaroundHours,
        isActive: treatment.isActive,
        sortOrder: treatment.sortOrder,
      },
      'Treatment updated successfully'
    );
  } catch (error) {
    console.error('PATCH /api/treatments/[id] error:', error);
    return apiResponse.error('Failed to update treatment');
  }
}

// ============================================================================
// DELETE /api/treatments/[id] - Delete treatment
// ============================================================================
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const businessId = session.user.businessId;

    // Check if treatment exists
    const existingTreatment = await prisma.treatment.findFirst({
      where: { id, businessId },
    });

    if (!existingTreatment) {
      return apiResponse.notFound('Treatment not found');
    }

    // Check for active orders using this treatment
    const activeOrderItems = await prisma.orderItem.count({
      where: {
        treatmentId: id,
        order: {
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      },
    });

    if (activeOrderItems > 0) {
      return apiResponse.badRequest(
        `Cannot delete treatment with ${activeOrderItems} active order(s). Complete or cancel them first.`
      );
    }

    // Delete treatment (this will cascade delete prices)
    await prisma.treatment.delete({
      where: { id },
    });

    return apiResponse.success(null, 'Treatment deleted successfully');
  } catch (error) {
    console.error('DELETE /api/treatments/[id] error:', error);
    return apiResponse.error('Failed to delete treatment');
  }
}