// app/api/services/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { createServiceSchema, generateServiceCode } from '@/lib/validations/service';

// ============================================================================
// GET /api/services - List all services
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      businessId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (activeOnly) {
      where.isActive = true;
    }

    // Fetch services with counts
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          _count: {
            select: {
              prices: true,
              orderItems: true,
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    // Get stats
    const [activeCount, comboCount] = await Promise.all([
      prisma.service.count({ where: { businessId, isActive: true } }),
      prisma.service.count({ where: { businessId, isCombo: true } }),
    ]);

    // Transform services
    const transformedServices = services.map((service) => ({
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
      itemsCount: service._count.prices,
      usageCount: service._count.orderItems,
    }));

    return apiResponse.success({
      services: transformedServices,
      stats: {
        total,
        active: activeCount,
        inactive: total - activeCount,
        combo: comboCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/services error:', error);
    return apiResponse.error('Failed to fetch services');
  }
}

// ============================================================================
// POST /api/services - Create service
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    const body = await req.json();

    // Generate code if not provided
    if (!body.code && body.name) {
      body.code = generateServiceCode(body.name);
    }

    // Validate input
    const validationResult = createServiceSchema.safeParse(body);
    if (!validationResult.success) {
      return apiResponse.badRequest(
        'Validation failed',
        validationResult.error.flatten().fieldErrors
      );
    }

    const data = validationResult.data;

    // Check for duplicate code
    const existingService = await prisma.service.findFirst({
      where: {
        businessId,
        code: data.code,
      },
    });

    if (existingService) {
      return apiResponse.badRequest('A service with this code already exists');
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        businessId,
        name: data.name,
        code: data.code || generateServiceCode(data.name),
        description: data.description,
        iconUrl: data.iconUrl,
        isCombo: data.isCombo,
        turnaroundHours: data.turnaroundHours,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    return apiResponse.created(
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
      'Service created successfully'
    );
  } catch (error) {
    console.error('POST /api/services error:', error);
    return apiResponse.error('Failed to create service');
  }
}