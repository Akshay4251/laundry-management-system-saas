// app/api/customer-app/auth/login/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse, handleCorsPreflightRequest } from '@/lib/customer-api-response';
import bcrypt from 'bcryptjs';
import {
  generateAccessToken,
  generateRefreshToken,
} from '@/lib/customer-jwt';

export async function OPTIONS() {
  return handleCorsPreflightRequest();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, password, deviceInfo } = body;

    if (!customerId || !password) {
      return customerApiResponse.badRequest('Customer ID and password are required');
    }

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
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!customer) {
      return customerApiResponse.notFound('Customer not found');
    }

    if (!customer.passwordHash) {
      return customerApiResponse.badRequest('Password not set. Please set your password first.');
    }

    const isValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isValid) {
      return customerApiResponse.badRequest('Invalid password');
    }

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
        address: customer.address,
      },
      business: {
        id: customer.business.id,
        name: customer.business.businessName,
        logoUrl: customer.business.logoUrl,
        phone: customer.business.phone,
        address: customer.business.address,
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return customerApiResponse.error('Failed to login');
  }
}