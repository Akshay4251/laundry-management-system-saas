// app/api/search/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { Prisma } from '@prisma/client';

type GlobalSearchResult = {
  id: string;
  type: 'order' | 'customer';
  title: string;
  subtitle?: string;
  href: string;
  badge: 'Order' | 'Customer';
};

type GlobalSearchResponse = {
  results: GlobalSearchResult[];
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return apiResponse.success<GlobalSearchResponse>({ results: [] });
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.success<GlobalSearchResponse>({ results: [] });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 10);
    const storeId = searchParams.get('storeId') || undefined;

    if (!q || q.length < 2) {
      return apiResponse.success<GlobalSearchResponse>({ results: [] });
    }

    const [orders, customers] = await Promise.all([
      prisma.order.findMany({
        where: {
          businessId,
          ...(storeId ? { storeId } : {}),
          OR: [
            { orderNumber: { contains: q, mode: 'insensitive' } },
            { customer: { fullName: { contains: q, mode: 'insensitive' } } },
            { customer: { phone: { contains: q } } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, fullName: true, phone: true },
          },
          store: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.customer.findMany({
        where: {
          businessId,
          deletedAt: null,
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const results: GlobalSearchResult[] = [
      ...orders.map((order) => ({
        id: order.id,
        type: 'order' as const,
        title: order.orderNumber,
        subtitle: `${order.customer.fullName} · ${order.customer.phone || ''}`.trim(),
        href: `/orders/${order.id}`,
        badge: 'Order' as const,
      })),
      ...customers.map((customer) => ({
        id: customer.id,
        type: 'customer' as const,
        title: customer.fullName,
        subtitle: `${customer.phone || ''}${
          customer.email ? ` · ${customer.email}` : ''
        }`.trim(),
        href: `/customers?search=${encodeURIComponent(customer.phone || customer.fullName)}`,
        badge: 'Customer' as const,
      })),
    ];

    return apiResponse.success<GlobalSearchResponse>({ results });
  } catch (error) {
    console.error('Global search error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return apiResponse.error('Failed to search', 500, error.message);
    }
    return apiResponse.error('Failed to search');
  }
}