// app/api/customer-app/services/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';

// ============================================================================
// GET /api/customer-app/services - Get rate card (items + treatments with prices)
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    // Get all active items with their treatment prices
    const items = await prisma.item.findMany({
      where: {
        businessId: customer.businessId,
        isActive: true,
        deletedAt: null,
        ...(category && category !== 'ALL' && { category: category as any }),
      },
      include: {
        prices: {
          where: { isAvailable: true },
          include: {
            treatment: {
              select: {
                id: true,
                name: true,
                code: true,
                turnaroundHours: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });

    // Get all active treatments for reference
    const treatments = await prisma.treatment.findMany({
      where: {
        businessId: customer.businessId,
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    // Get business settings for express multiplier
    const settings = await prisma.businessSettings.findUnique({
      where: { businessId: customer.businessId },
      select: { expressMultiplier: true },
    });

    // Transform items
    const transformedItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      iconUrl: item.iconUrl,
      prices: item.prices
        .filter((p) => p.treatment.isActive)
        .map((p) => ({
          treatmentId: p.treatment.id,
          treatmentName: p.treatment.name,
          treatmentCode: p.treatment.code,
          turnaroundHours: p.treatment.turnaroundHours,
          price: parseFloat(p.price.toString()),
          expressPrice: p.expressPrice
            ? parseFloat(p.expressPrice.toString())
            : null,
        })),
    }));

    // Group by category
    const groupedItems: Record<string, typeof transformedItems> = {};
    transformedItems.forEach((item) => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = [];
      }
      groupedItems[item.category].push(item);
    });

    return customerApiResponse.success({
      items: transformedItems,
      groupedItems,
      treatments: treatments.map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        turnaroundHours: t.turnaroundHours,
      })),
      expressMultiplier: settings?.expressMultiplier
        ? parseFloat(settings.expressMultiplier.toString())
        : 1.5,
      categories: ['GARMENT', 'HOUSEHOLD', 'SPECIALTY'],
    });
  } catch (error) {
    console.error('Get services error:', error);
    return customerApiResponse.error('Failed to fetch services');
  }
}