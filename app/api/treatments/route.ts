// app/api/treatments/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { createTreatmentSchema, generateTreatmentCode } from '@/lib/validations/treatment';

// ============================================================================
// GET /api/treatments - List all treatments
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

    // Fetch treatments with counts
    const [treatments, total] = await Promise.all([
      prisma.treatment.findMany({
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
      prisma.treatment.count({ where }),
    ]);

    // Get stats
    const [activeCount, comboCount] = await Promise.all([
      prisma.treatment.count({ where: { businessId, isActive: true } }),
      prisma.treatment.count({ where: { businessId, isCombo: true } }),
    ]);

    // Transform treatments
    const transformedTreatments = treatments.map((treatment) => ({
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
      itemsCount: treatment._count.prices,
      usageCount: treatment._count.orderItems,
    }));

    return apiResponse.success({
      treatments: transformedTreatments,
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
    console.error('GET /api/treatments error:', error);
    return apiResponse.error('Failed to fetch treatments');
  }
}

// ============================================================================
// POST /api/treatments - Create treatment
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
      body.code = generateTreatmentCode(body.name);
    }

    // Validate input
    const validationResult = createTreatmentSchema.safeParse(body);
    if (!validationResult.success) {
      return apiResponse.badRequest(
        'Validation failed',
        validationResult.error.flatten().fieldErrors
      );
    }

    const data = validationResult.data;

    // Check for duplicate code
    const existingTreatment = await prisma.treatment.findFirst({
      where: {
        businessId,
        code: data.code,
      },
    });

    if (existingTreatment) {
      return apiResponse.badRequest('A treatment with this code already exists');
    }

    // Create treatment
    const treatment = await prisma.treatment.create({
      data: {
        businessId,
        name: data.name,
        code: data.code || generateTreatmentCode(data.name),
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
      'Treatment created successfully'
    );
  } catch (error) {
    console.error('POST /api/treatments error:', error);
    return apiResponse.error('Failed to create treatment');
  }
}