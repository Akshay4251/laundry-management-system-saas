// app/api/services/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { createServiceSchema } from '@/lib/validations/service';
import { ItemCategory } from '@prisma/client';

// ============================================================================
// GET /api/services
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    const { searchParams } = new URL(req.url);

    const storeId = searchParams.get('storeId');
    const search = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category'); // ✅ Get as string first
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      businessId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { serviceTypes: { hasSome: [search] } },
      ];
    }

    // ✅ Fixed: Check if categoryParam is valid and not 'ALL'
    if (categoryParam && categoryParam !== 'ALL' && Object.values(ItemCategory).includes(categoryParam as ItemCategory)) {
      where.category = categoryParam as ItemCategory;
    }

    if (activeOnly) {
      where.isActive = true;
    }

    // Store-specific query
    if (storeId) {
      const [storeServices, total] = await Promise.all([
        prisma.storeService.findMany({
          where: {
            storeId,
            isAvailable: true,
            service: where,
          },
          include: {
            service: true,
          },
          skip,
          take: limit,
          orderBy: {
            service: { name: 'asc' },
          },
        }),
        prisma.storeService.count({
          where: {
            storeId,
            isAvailable: true,
            service: where,
          },
        }),
      ]);

      const services = storeServices.map((ss) => ({
        id: ss.service.id,
        name: ss.service.name,
        description: ss.service.description,
        category: ss.service.category,
        iconUrl: ss.service.iconUrl,
        price: parseFloat(ss.price.toString()),
        basePrice: parseFloat(ss.service.basePrice.toString()),
        expressPrice: ss.service.expressPrice
          ? parseFloat(ss.service.expressPrice.toString())
          : null,
        unit: ss.service.unit,
        turnaroundTime: ss.service.turnaroundTime,
        serviceTypes: ss.service.serviceTypes,
        isActive: ss.service.isActive,
        storePrice: parseFloat(ss.price.toString()),
        isAvailable: ss.isAvailable,
      }));

      return apiResponse.success({
        services,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    }

    // Base services query
    const [services, total, counts] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
      prisma.service.count({ where }),
      prisma.service.groupBy({
        by: ['category'],
        where: { businessId, deletedAt: null },
        _count: true,
      }),
    ]);

    const activeCount = await prisma.service.count({
      where: { businessId, deletedAt: null, isActive: true },
    });

    const transformedServices = services.map((service) => ({
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
    }));

    const categoryCounts: Record<string, number> = {};
    counts.forEach((c) => {
      categoryCounts[c.category] = c._count;
    });

    return apiResponse.success({
      services: transformedServices,
      stats: {
        total,
        active: activeCount,
        inactive: total - activeCount,
        byCategory: categoryCounts,
      },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/services error:', error);
    return apiResponse.error('Failed to fetch services');
  }
}

// ============================================================================
// POST /api/services
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    const body = await req.json();

    const validationResult = createServiceSchema.safeParse(body);
    if (!validationResult.success) {
      return apiResponse.badRequest(
        'Validation failed',
        validationResult.error.flatten().fieldErrors
      );
    }

    const data = validationResult.data;

    // Check duplicate name
    const existingService = await prisma.service.findFirst({
      where: {
        businessId,
        name: { equals: data.name, mode: 'insensitive' },
        deletedAt: null,
      },
    });

    if (existingService) {
      return apiResponse.badRequest('A service with this name already exists');
    }

    const expressPrice = data.expressPrice ?? Math.round(data.basePrice * 1.5);

    const service = await prisma.service.create({
      data: {
        businessId,
        name: data.name,
        description: data.description,
        category: data.category as ItemCategory,
        iconUrl: data.iconUrl || null,
        basePrice: data.basePrice,
        expressPrice,
        unit: data.unit,
        turnaroundTime: data.turnaroundTime,
        serviceTypes: data.serviceTypes,
        isActive: data.isActive,
      },
    });

    // Create store services
    const stores = await prisma.store.findMany({
      where: { businessId, isActive: true },
      select: { id: true },
    });

    if (stores.length > 0) {
      await prisma.storeService.createMany({
        data: stores.map((store) => ({
          storeId: store.id,
          serviceId: service.id,
          price: service.basePrice,
          isAvailable: true,
        })),
        skipDuplicates: true,
      });
    }

    return apiResponse.created(
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
      'Service created successfully'
    );
  } catch (error) {
    console.error('POST /api/services error:', error);
    return apiResponse.error('Failed to create service');
  }
}