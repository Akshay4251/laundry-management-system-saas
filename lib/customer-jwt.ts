// lib/customer-jwt.ts

import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export interface CustomerJWTPayload {
  customerId: string;
  businessId: string;
  phone: string;
  type: 'access' | 'refresh';
}

export function generateAccessToken(payload: Omit<CustomerJWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export async function generateRefreshToken(
  customerId: string,
  businessId: string,
  phone: string,
  deviceInfo?: string
): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.customerRefreshToken.create({
    data: {
      customerId,
      token,
      deviceInfo,
      expiresAt,
    },
  });

  return token;
}

export function verifyAccessToken(token: string): CustomerJWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomerJWTPayload;
    if (decoded.type !== 'access') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{
  customerId: string;
  businessId: string;
  phone: string;
} | null> {
  const refreshToken = await prisma.customerRefreshToken.findUnique({
    where: { token },
    include: {
      customer: {
        select: {
          id: true,
          businessId: true,
          phone: true,
          isAppEnabled: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!refreshToken) return null;
  if (!refreshToken.isValid) return null;
  if (refreshToken.expiresAt < new Date()) return null;
  if (!refreshToken.customer) return null;
  if (!refreshToken.customer.isAppEnabled) return null;
  if (refreshToken.customer.deletedAt) return null;

  return {
    customerId: refreshToken.customer.id,
    businessId: refreshToken.customer.businessId,
    phone: refreshToken.customer.phone,
  };
}

export async function invalidateRefreshToken(token: string): Promise<void> {
  await prisma.customerRefreshToken.updateMany({
    where: { token },
    data: { isValid: false },
  });
}

export async function invalidateAllRefreshTokens(customerId: string): Promise<void> {
  await prisma.customerRefreshToken.updateMany({
    where: { customerId },
    data: { isValid: false },
  });
}