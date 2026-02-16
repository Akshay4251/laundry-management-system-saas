// app/api/delivery-app/auth/login/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverApiResponse, handleDriverCorsPreflightRequest } from '@/lib/driver-api-response';
import bcrypt from 'bcryptjs';
import {
  generateDriverAccessToken,
  generateDriverRefreshToken,
} from '@/lib/driver-jwt';

export async function OPTIONS() {
  return handleDriverCorsPreflightRequest();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, deviceInfo } = body;

    if (!identifier || !password) {
      return driverApiResponse.badRequest('Email/Phone and password are required');
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const isEmail = cleanIdentifier.includes('@');

    // Find driver by email or phone
    const driver = await prisma.driver.findFirst({
      where: {
        OR: [
          { email: isEmail ? cleanIdentifier : undefined },
          { phone: !isEmail ? identifier.replace(/\D/g, '') : undefined },
        ],
        isActive: true,
        deletedAt: null,
      },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            phone: true,
            address: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!driver) {
      return driverApiResponse.badRequest('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, driver.passwordHash);
    if (!isValid) {
      return driverApiResponse.badRequest('Invalid credentials');
    }

    const accessToken = generateDriverAccessToken({
      driverId: driver.id,
      businessId: driver.businessId,
      phone: driver.phone,
      email: driver.email,
    });

    const refreshToken = await generateDriverRefreshToken(driver.id, deviceInfo);

    return driverApiResponse.success({
      accessToken,
      refreshToken,
      driver: {
        id: driver.id,
        fullName: driver.fullName,
        phone: driver.phone,
        email: driver.email,
      },
      business: {
        id: driver.business.id,
        name: driver.business.businessName,
        phone: driver.business.phone,
        address: driver.business.address,
        logoUrl: driver.business.logoUrl,
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Driver login error:', error);
    return driverApiResponse.error('Failed to login');
  }
}