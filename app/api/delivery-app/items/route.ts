// app/api/delivery-app/items/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverApiResponse, handleDriverCorsPreflightRequest } from '@/lib/driver-api-response';
import { authenticateDriver } from '@/lib/driver-auth';

export async function OPTIONS() {
  return handleDriverCorsPreflightRequest();
}

export async function GET(req: NextRequest) {
  try {
    const driver = await authenticateDriver(req);
    if (!driver) {
      return driverApiResponse.unauthorized();
    }

    const businessId = driver.businessId;

    const [items, services] = await Promise.all([
      prisma.item.findMany({
        where: {
          businessId,
          isActive: true,
          deletedAt: null,
        },
        include: {
          prices: {
            where: { isAvailable: true },
            include: {
              service: {
                select: { id: true, name: true, code: true },
              },
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.service.findMany({
        where: { businessId, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
    ]);

    const transformedItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      iconUrl: item.iconUrl,
      prices: item.prices.map((p) => ({
        serviceId: p.serviceId,
        serviceName: p.service.name,
        serviceCode: p.service.code,
        price: parseFloat(p.price.toString()),
        expressPrice: p.expressPrice ? parseFloat(p.expressPrice.toString()) : null,
        isAvailable: p.isAvailable,
      })),
    }));

    const transformedServices = services.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      turnaroundHours: t.turnaroundHours,
    }));

    return driverApiResponse.success({
      items: transformedItems,
      services: transformedServices,
    });
  } catch (error) {
    console.error('Get items error:', error);
    return driverApiResponse.error('Failed to fetch items');
  }
}