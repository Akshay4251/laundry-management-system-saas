// app/api/inventory/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createInventorySchema, inventoryQuerySchema } from '@/lib/validations/inventory';
import {
  successResponse,
  errorResponse,
  handleZodError,
  handlePrismaError,
} from '@/lib/api-response';
import { Prisma } from '@prisma/client';

/**
 * GET /api/inventory
 * List inventory items with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('Business not found', 404);
    }

    const { searchParams } = new URL(req.url);
    const queryValidation = inventoryQuerySchema.safeParse({
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      lowStockOnly: searchParams.get('lowStockOnly'),
      storeId: searchParams.get('storeId'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      includeDeleted: searchParams.get('includeDeleted'),
    });

    if (!queryValidation.success) {
      return handleZodError(queryValidation.error);
    }

    const {
      search,
      category,
      lowStockOnly,
      storeId,
      page,
      limit,
      sortBy,
      sortOrder,
      includeDeleted,
    } = queryValidation.data;

    // Build where clause
    const where: Prisma.InventoryItemWhereInput = {
      businessId,
      ...(!includeDeleted && { deletedAt: null }),
      ...(storeId && { storeId }),
      ...(category !== 'all' && { category: category as Prisma.EnumInventoryCategoryFilter }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { supplier: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // For low stock filter, we need a raw query approach
    let items;
    let total;

    if (lowStockOnly) {
      // Use raw comparison for low stock
      const baseWhere: Prisma.InventoryItemWhereInput = {
        businessId,
        ...(!includeDeleted && { deletedAt: null }),
        ...(storeId && { storeId }),
        ...(category !== 'all' && { category: category as Prisma.EnumInventoryCategoryFilter }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { supplier: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const allItems = await prisma.inventoryItem.findMany({
        where: baseWhere,
        orderBy: { [sortBy]: sortOrder },
      });

      const lowStockItems = allItems.filter(item => item.currentStock <= item.minStock);
      total = lowStockItems.length;
      items = lowStockItems.slice((page - 1) * limit, page * limit);
    } else {
      const orderBy: Prisma.InventoryItemOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      [items, total] = await Promise.all([
        prisma.inventoryItem.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.inventoryItem.count({ where }),
      ]);
    }

    // Transform items with computed fields
    const transformedItems = items.map((item) => {
      const costPerUnit = parseFloat(item.costPerUnit.toString());
      const totalValue = item.currentStock * costPerUnit;
      const isLowStock = item.currentStock <= item.minStock;
      const stockPercentage = item.minStock > 0 
        ? Math.min((item.currentStock / item.minStock) * 100, 100)
        : 100;
      
      const daysSinceRestock = item.lastRestockedAt
        ? Math.floor((Date.now() - new Date(item.lastRestockedAt).getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      return {
        id: item.id,
        businessId: item.businessId,
        storeId: item.storeId,
        name: item.name,
        description: item.description,
        sku: item.sku,
        category: item.category,
        currentStock: item.currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock,
        unit: item.unit,
        costPerUnit,
        supplier: item.supplier,
        supplierPhone: item.supplierPhone,
        supplierEmail: item.supplierEmail,
        lastRestockedAt: item.lastRestockedAt?.toISOString() || null,
        lastRestockedBy: item.lastRestockedBy,
        isActive: item.isActive,
        deletedAt: item.deletedAt?.toISOString() || null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        // Computed fields
        totalValue,
        isLowStock,
        stockPercentage,
        daysSinceRestock,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      data: transformedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse('Failed to fetch inventory', 500);
  }
}

/**
 * POST /api/inventory
 * Create a new inventory item
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('Business not found', 404);
    }

    const body = await req.json();
    const validationResult = createInventorySchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const data = validationResult.data;

    // Check for duplicate SKU if provided
    if (data.sku) {
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          businessId,
          sku: data.sku,
          deletedAt: null,
        },
      });

      if (existingItem) {
        return errorResponse('An item with this SKU already exists', 409);
      }
    }

    // Generate SKU if not provided
    const sku = data.sku || `INV-${Date.now().toString(36).toUpperCase()}`;

    // Get the user's name for tracking
    const userName = session.user.name || 'Unknown User';

    const item = await prisma.inventoryItem.create({
      data: {
        businessId,
        name: data.name,
        description: data.description,
        sku,
        category: data.category,
        currentStock: data.currentStock,
        minStock: data.minStock,
        maxStock: data.maxStock,
        unit: data.unit,
        costPerUnit: data.costPerUnit,
        supplier: data.supplier,
        supplierPhone: data.supplierPhone,
        supplierEmail: data.supplierEmail || null,
        storeId: data.storeId,
        isActive: data.isActive ?? true,
        lastRestockedAt: data.currentStock > 0 ? new Date() : null,
        lastRestockedBy: data.currentStock > 0 ? userName : null,
      },
    });

    // Create initial restock log if starting with stock
    if (data.currentStock > 0) {
      await prisma.inventoryRestockLog.create({
        data: {
          inventoryItemId: item.id,
          previousStock: 0,
          addedStock: data.currentStock,
          newStock: data.currentStock,
          costPerUnit: data.costPerUnit,
          totalCost: data.currentStock * data.costPerUnit,
          notes: 'Initial stock',
          restockedBy: userName,
        },
      });
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
    };

    return successResponse(
      { item: transformedItem },
      'Inventory item created successfully',
      201
    );
  } catch (error) {
    console.error('Inventory creation error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return errorResponse('Failed to create inventory item', 500);
  }
}