// lib/driver-auth.ts

import { NextRequest } from 'next/server';
import { verifyDriverAccessToken, DriverJWTPayload } from './driver-jwt';
import { prisma } from './prisma';

export interface AuthenticatedDriver {
  id: string;
  businessId: string;
  fullName: string;
  phone: string;
  email: string | null;
}

export async function authenticateDriver(
  req: NextRequest
): Promise<AuthenticatedDriver | null> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyDriverAccessToken(token);

  if (!payload) {
    return null;
  }

  const driver = await prisma.driver.findFirst({
    where: {
      id: payload.driverId,
      businessId: payload.businessId,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      businessId: true,
      fullName: true,
      phone: true,
      email: true,
    },
  });

  return driver;
}

export function getDriverFromRequest(req: NextRequest): DriverJWTPayload | null {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyDriverAccessToken(token);
}