// app/api/services/[id]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { updateServiceSchema } from '@/lib/validations/service';
import { ItemCategory } from '@prisma/client'; // ✅ CHANGED

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET /api/services/[id]
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
      where: { id, businessId, deletedAt: null },
      include: {
        storeServices: {
          include: {
            store: { select: { id: true, name: true } },
          },
        },
        _count: { select: { orderItems: true } }, // ✅ NOW WORKS
      },
    });

    if (!service) {
      return apiResponse.notFound('Service not found');
    }

    return apiResponse.success({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      iconUrl: service.iconUrl,
      basePrice: parseFloat(service.basePrice.toString()),
      expressPrice: service.expressPrice
        ? parseFloat(service.expressPrice.toString())
        : null,
      unit: service.unit,
      turnaroundTime: service.turnaroundTime,
      serviceTypes: service.serviceTypes,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      storeServices: service.storeServices.map((ss) => ({
        storeId: ss.store.id,
        storeName: ss.store.name,
        price: parseFloat(ss.price.toString()),
        isAvailable: ss.isAvailable,
      })),
      usageCount: service._count.orderItems,
    });
  } catch (error) {
    console.error('GET /api/services/[id] error:', error);
    return apiResponse.error('Failed to fetch service');
  }
}

// ============================================================================
// PATCH /api/services/[id]
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

    const existingService = await prisma.service.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existingService) {
      return apiResponse.notFound('Service not found');
    }

    const validationResult = updateServiceSchema.safeParse(body);
    if (!validationResult.success) {
      return apiResponse.badRequest(
        'Validation failed',
        validationResult.error.flatten().fieldErrors
      );
    }

    const data = validationResult.data;

    // Check duplicate name
    if (data.name) {
      const duplicateService = await prisma.service.findFirst({
        where: {
          businessId,
          name: { equals: data.name, mode: 'insensitive' },
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicateService) {
        return apiResponse.badRequest('A service with this name already exists');
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category as ItemCategory }), // ✅ CHANGED
        ...(data.iconUrl !== undefined && { iconUrl: data.iconUrl }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.expressPrice !== undefined && { expressPrice: data.expressPrice }),
        ...(data.unit && { unit: data.unit }),
        ...(data.turnaroundTime !== undefined && { turnaroundTime: data.turnaroundTime }),
        ...(data.serviceTypes && { serviceTypes: data.serviceTypes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return apiResponse.success(
      {
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        iconUrl: service.iconUrl,
        basePrice: parseFloat(service.basePrice.toString()),
        expressPrice: service.expressPrice
          ? parseFloat(service.expressPrice.toString())
          : null,
        unit: service.unit,
        turnaroundTime: service.turnaroundTime,
        serviceTypes: service.serviceTypes,
        isActive: service.isActive,
      },
      'Service updated successfully'
    );
  } catch (error) {
    console.error('PATCH /api/services/[id] error:', error);
    return apiResponse.error('Failed to update service');
  }
}

// ============================================================================
// DELETE /api/services/[id]
// ============================================================================
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const businessId = session.user.businessId;

    const existingService = await prisma.service.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!existingService) {
      return apiResponse.notFound('Service not found');
    }

    // Check active orders using this service
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
        `Cannot delete service with ${activeOrderItems} active order(s)`
      );
    }

    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await prisma.storeService.updateMany({
      where: { serviceId: id },
      data: { isAvailable: false },
    });

    return apiResponse.success(null, 'Service deleted successfully');
  } catch (error) {
    console.error('DELETE /api/services/[id] error:', error);
    return apiResponse.error('Failed to delete service');
  }
}