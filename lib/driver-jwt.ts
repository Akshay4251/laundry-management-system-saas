// lib/driver-jwt.ts

import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const JWT_SECRET = process.env.DRIVER_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'driver-secret-key';
const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export interface DriverJWTPayload {
  driverId: string;
  businessId: string;
  phone: string;
  email: string | null;
  type: 'access' | 'refresh';
}

export function generateDriverAccessToken(payload: Omit<DriverJWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export async function generateDriverRefreshToken(
  driverId: string,
  deviceInfo?: string
): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.driverRefreshToken.create({
    data: {
      driverId,
      token,
      deviceInfo,
      expiresAt,
    },
  });

  return token;
}

export function verifyDriverAccessToken(token: string): DriverJWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DriverJWTPayload;
    if (decoded.type !== 'access') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function verifyDriverRefreshToken(token: string): Promise<{
  driverId: string;
  businessId: string;
  phone: string;
  email: string | null;
} | null> {
  const refreshToken = await prisma.driverRefreshToken.findUnique({
    where: { token },
    include: {
      driver: {
        select: {
          id: true,
          businessId: true,
          phone: true,
          email: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!refreshToken) return null;
  if (!refreshToken.isValid) return null;
  if (refreshToken.expiresAt < new Date()) return null;
  if (!refreshToken.driver) return null;
  if (!refreshToken.driver.isActive) return null;
  if (refreshToken.driver.deletedAt) return null;

  return {
    driverId: refreshToken.driver.id,
    businessId: refreshToken.driver.businessId,
    phone: refreshToken.driver.phone,
    email: refreshToken.driver.email,
  };
}

export async function invalidateDriverRefreshToken(token: string): Promise<void> {
  await prisma.driverRefreshToken.updateMany({
    where: { token },
    data: { isValid: false },
  });
}

export async function invalidateAllDriverRefreshTokens(driverId: string): Promise<void> {
  await prisma.driverRefreshToken.updateMany({
    where: { driverId },
    data: { isValid: false },
  });
}