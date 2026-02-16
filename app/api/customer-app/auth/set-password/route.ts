// app/api/customer-app/auth/set-password/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import bcrypt from 'bcryptjs';
import {
  generateAccessToken,
  generateRefreshToken,
} from '@/lib/customer-jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, password, deviceInfo } = body;

    if (!customerId) {
      return customerApiResponse.badRequest('Customer ID is required');
    }

    if (!password || password.length < 6) {
      return customerApiResponse.badRequest('Password must be at least 6 characters');
    }

    // Get customer
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        deletedAt: null,
        isAppEnabled: true,
      },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!customer) {
      return customerApiResponse.notFound('Customer not found');
    }

    if (customer.passwordHash) {
      return customerApiResponse.badRequest('Password already set. Please login.');
    }

    // Hash password and update customer
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        passwordHash,
        appRegisteredAt: new Date(),
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      customerId: customer.id,
      businessId: customer.businessId,
      phone: customer.phone,
    });

    const refreshToken = await generateRefreshToken(
      customer.id,
      customer.businessId,
      customer.phone,
      deviceInfo
    );

    return customerApiResponse.success({
      accessToken,
      refreshToken,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
      },
      business: {
        id: customer.business.id,
        name: customer.business.businessName,
        logoUrl: customer.business.logoUrl,
      },
    }, 'Password set successfully');
  } catch (error) {
    console.error('Set password error:', error);
    return customerApiResponse.error('Failed to set password');
  }
}