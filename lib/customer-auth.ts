// lib/customer-auth.ts

import { NextRequest } from 'next/server';
import { verifyAccessToken, CustomerJWTPayload } from './customer-jwt';
import { prisma } from './prisma';

export interface AuthenticatedCustomer {
  id: string;
  businessId: string;
  phone: string;
  fullName: string;
  email: string | null;
}

export async function authenticateCustomer(
  req: NextRequest
): Promise<AuthenticatedCustomer | null> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    return null;
  }

  // Verify customer still exists and is active
  const customer = await prisma.customer.findFirst({
    where: {
      id: payload.customerId,
      businessId: payload.businessId,
      isAppEnabled: true,
      deletedAt: null,
    },
    select: {
      id: true,
      businessId: true,
      phone: true,
      fullName: true,
      email: true,
    },
  });

  return customer;
}

export function getCustomerFromRequest(req: NextRequest): CustomerJWTPayload | null {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}