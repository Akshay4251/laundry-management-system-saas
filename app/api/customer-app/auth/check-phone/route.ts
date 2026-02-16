// app/api/customer-app/auth/check-phone/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse, handleCorsPreflightRequest } from '@/lib/customer-api-response';

export async function OPTIONS() {
  return handleCorsPreflightRequest();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || phone.length < 10) {
      return customerApiResponse.badRequest('Valid phone number is required');
    }

    const cleanPhone = phone.replace(/\D/g, '');

    const customers = await prisma.customer.findMany({
      where: {
        phone: cleanPhone,
        deletedAt: null,
        isAppEnabled: true,
      },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
            planStatus: true,
          },
        },
      },
    });

    const validCustomers = customers.filter(
      (c) =>
        c.business.planStatus === 'ACTIVE' ||
        c.business.planStatus === 'TRIAL'
    );

    if (validCustomers.length === 0) {
      return customerApiResponse.success({
        exists: false,
        message: 'Phone number not registered. Please contact your laundry to register.',
      });
    }

    const businesses = validCustomers.map((c) => ({
      customerId: c.id,
      businessId: c.business.id,
      businessName: c.business.businessName,
      logoUrl: c.business.logoUrl,
      hasPassword: !!c.passwordHash,
      customerName: c.fullName,
    }));

    return customerApiResponse.success({
      exists: true,
      requiresBusinessSelection: businesses.length > 1,
      businesses,
    });
  } catch (error) {
    console.error('Check phone error:', error);
    return customerApiResponse.error('Failed to check phone number');
  }
}