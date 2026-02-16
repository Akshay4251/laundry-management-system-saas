// app/api/delivery-app/profile/route.ts

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

    const driverData = await prisma.driver.findUnique({
      where: { id: driver.id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        createdAt: true,
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

    if (!driverData) {
      return driverApiResponse.notFound('Driver not found');
    }

    return driverApiResponse.success({
      ...driverData,
      business: {
        id: driverData.business.id,
        name: driverData.business.businessName,
        phone: driverData.business.phone,
        address: driverData.business.address,
        logoUrl: driverData.business.logoUrl,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return driverApiResponse.error('Failed to fetch profile');
  }
}