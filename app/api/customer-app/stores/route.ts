// app/api/customer-app/stores/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';

// ============================================================================
// GET /api/customer-app/stores - Get available stores
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const stores = await prisma.store.findMany({
      where: {
        businessId: customer.businessId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
      orderBy: { name: 'asc' },
    });

    return customerApiResponse.success({ stores });
  } catch (error) {
    console.error('Get stores error:', error);
    return customerApiResponse.error('Failed to fetch stores');
  }
}