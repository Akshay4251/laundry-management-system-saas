// app/api/items/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse, createPagination, handlePrismaError } from '@/lib/api-response';
import { Prisma, ItemCategory } from '@prisma/client';

// ============================================================================
// GET /api/items - List all items with treatment prices
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
    const category = searchParams.get('category') as ItemCategory | 'all' | null;
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ItemWhereInput = {
      businessId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      where.category = category as ItemCategory;
    }

    if (activeOnly) {
      where.isActive = true;
    }

    // Fetch items with prices and treatments
    const [items, total, treatments] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          prices: {
            include: {
              treatment: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  isActive: true,
                },
              },
            },
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.item.count({ where }),
      prisma.treatment.findMany({
        where: { businessId, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
    ]);

    // Get stats
    const stats = await prisma.item.groupBy({
      by: ['category', 'isActive'],
      where: { businessId, deletedAt: null },
      _count: true,
    });

    const statsData = {
      total,
      active: stats.filter(s => s.isActive).reduce((sum, s) => sum + s._count, 0),
      inactive: stats.filter(s => !s.isActive).reduce((sum, s) => sum + s._count, 0),
      byCategory: {
        GARMENT: stats.filter(s => s.category === 'GARMENT').reduce((sum, s) => sum + s._count, 0),
        HOUSEHOLD: stats.filter(s => s.category === 'HOUSEHOLD').reduce((sum, s) => sum + s._count, 0),
        SPECIALTY: stats.filter(s => s.category === 'SPECIALTY').reduce((sum, s) => sum + s._count, 0),
      },
      totalPricesSet: items.reduce((sum, item) => sum + item.prices.length, 0),
    };

    // Transform items with pricing
    const transformedItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      iconUrl: item.iconUrl,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      usageCount: item._count.orderItems,
      pricesCount: item.prices.length,
      availablePricesCount: item.prices.filter((p) => p.isAvailable).length,
      prices: treatments.map((treatment) => {
        const priceEntry = item.prices.find((p) => p.treatmentId === treatment.id);
        return {
          treatmentId: treatment.id,
          treatmentName: treatment.name,
          treatmentCode: treatment.code,
          price: priceEntry ? parseFloat(priceEntry.price.toString()) : null,
          expressPrice: priceEntry?.expressPrice
            ? parseFloat(priceEntry.expressPrice.toString())
            : null,
          isAvailable: priceEntry?.isAvailable ?? false,
        };
      }),
    }));

    return apiResponse.success({
      items: transformedItems,
      treatments: treatments.map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        turnaroundHours: t.turnaroundHours,
      })),
      stats: statsData,
      pagination: createPagination(total, page, limit),
    });
  } catch (error) {
    console.error('GET /api/items error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to fetch items');
  }
}

// ============================================================================
// POST /api/items - Create item with inline pricing
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    const body = await req.json();

    const { name, description, category, iconUrl, isActive, sortOrder, prices } = body;

    // Validation
    if (!name || name.trim().length < 2) {
      return apiResponse.badRequest('Item name is required (min 2 characters)');
    }

    // Check for duplicate name
    const existingItem = await prisma.item.findFirst({
      where: {
        businessId,
        name: { equals: name.trim(), mode: 'insensitive' },
        deletedAt: null,
      },
    });

    if (existingItem) {
      return apiResponse.conflict('An item with this name already exists');
    }

    // Create item with prices in transaction
    const item = await prisma.$transaction(async (tx) => {
      const newItem = await tx.item.create({
        data: {
          businessId,
          name: name.trim(),
          description: description?.trim() || null,
          category: category || 'GARMENT',
          iconUrl: iconUrl || null,
          isActive: isActive ?? true,
          sortOrder: sortOrder ?? 0,
        },
      });

      // Create prices if provided
      if (prices && Array.isArray(prices) && prices.length > 0) {
        await tx.itemTreatmentPrice.createMany({
          data: prices.map((p: any) => ({
            businessId,
            itemId: newItem.id,
            treatmentId: p.treatmentId,
            price: p.price,
            expressPrice: p.expressPrice || null,
            isAvailable: p.isAvailable ?? true,
          })),
        });
      }

      return newItem;
    });

    // Fetch complete item with prices
    const completeItem = await prisma.item.findUnique({
      where: { id: item.id },
      include: {
        prices: {
          include: {
            treatment: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    return apiResponse.created(
      {
        id: completeItem!.id,
        name: completeItem!.name,
        description: completeItem!.description,
        category: completeItem!.category,
        iconUrl: completeItem!.iconUrl,
        isActive: completeItem!.isActive,
        sortOrder: completeItem!.sortOrder,
        prices: completeItem!.prices.map((p) => ({
          treatmentId: p.treatmentId,
          treatmentName: p.treatment.name,
          price: parseFloat(p.price.toString()),
          expressPrice: p.expressPrice ? parseFloat(p.expressPrice.toString()) : null,
          isAvailable: p.isAvailable,
        })),
      },
      'Item created successfully'
    );
  } catch (error) {
    console.error('POST /api/items error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to create item');
  }
}