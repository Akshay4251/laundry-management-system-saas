// app/api/services/[id]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { updateServiceSchema } from '@/lib/validations/service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET /api/services/[id] - Get single service
// ============================================================================
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const businessId = session.user.businessId;

    const service = await prisma.service.findFirst({
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

    if (!service) {
      return apiResponse.notFound('Service not found');
    }

    // Transform prices
    const itemPrices = service.prices.map((p) => ({
      itemId: p.item.id,
      itemName: p.item.name,
      itemCategory: p.item.category,
      itemIconUrl: p.item.iconUrl,
      price: parseFloat(p.price.toString()),
      expressPrice: p.expressPrice ? parseFloat(p.expressPrice.toString()) : null,
      isAvailable: p.isAvailable,
    }));

    return apiResponse.success({
      id: service.id,
      name: service.name,
      code: service.code,
      description: service.description,
      iconUrl: service.iconUrl,
      isCombo: service.isCombo,
      turnaroundHours: service.turnaroundHours,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      itemPrices,
      usageCount: service._count.orderItems,
    });
  } catch (error) {
    console.error('GET /api/services/[id] error:', error);
    return apiResponse.error('Failed to fetch service');
  }
}

// ============================================================================
// PATCH /api/services/[id] - Update service
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

    // Check if service exists
    const existingService = await prisma.service.findFirst({
      where: { id, businessId },
    });

    if (!existingService) {
      return apiResponse.notFound('Service not found');
    }

    // Validate input
    const validationResult = updateServiceSchema.safeParse(body);
    if (!validationResult.success) {
      return apiResponse.badRequest(
        'Validation failed',
        validationResult.error.flatten().fieldErrors
      );
    }

    const data = validationResult.data;

    // Check for duplicate code if code is being changed
    if (data.code && data.code !== existingService.code) {
      const duplicateService = await prisma.service.findFirst({
        where: {
          businessId,
          code: data.code,
          id: { not: id },
        },
      });

      if (duplicateService) {
        return apiResponse.badRequest('A service with this code already exists');
      }
    }

    // Update service
    const service = await prisma.service.update({
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
        id: service.id,
        name: service.name,
        code: service.code,
        description: service.description,
        iconUrl: service.iconUrl,
        isCombo: service.isCombo,
        turnaroundHours: service.turnaroundHours,
        isActive: service.isActive,
        sortOrder: service.sortOrder,
      },
      'Service updated successfully'
    );
  } catch (error) {
    console.error('PATCH /api/services/[id] error:', error);
    return apiResponse.error('Failed to update service');
  }
}

// ============================================================================
// DELETE /api/services/[id] - Delete service
// ============================================================================
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const businessId = session.user.businessId;

    // Check if service exists
    const existingService = await prisma.service.findFirst({
      where: { id, businessId },
    });

    if (!existingService) {
      return apiResponse.notFound('Service not found');
    }

    // Check for active orders using this service
    const activeOrderItems = await prisma.orderItem.count({
      where: {
        serviceId: id,
        order: {
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      },
    });

    if (activeOrderItems > 0) {
      return apiResponse.badRequest(
        `Cannot delete service with ${activeOrderItems} active order(s). Complete or cancel them first.`
      );
    }

    // Delete service (this will cascade delete prices)
    await prisma.service.delete({
      where: { id },
    });

    return apiResponse.success(null, 'Service deleted successfully');
  } catch (error) {
    console.error('DELETE /api/services/[id] error:', error);
    return apiResponse.error('Failed to delete service');
  }
}