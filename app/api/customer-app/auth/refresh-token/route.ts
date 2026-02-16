// app/api/customer-app/auth/refresh-token/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  invalidateRefreshToken,
} from '@/lib/customer-jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken, deviceInfo } = body;

    if (!refreshToken) {
      return customerApiResponse.badRequest('Refresh token is required');
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return customerApiResponse.unauthorized('Invalid or expired refresh token');
    }

    // Invalidate old refresh token
    await invalidateRefreshToken(refreshToken);

    // Generate new tokens
    const accessToken = generateAccessToken({
      customerId: payload.customerId,
      businessId: payload.businessId,
      phone: payload.phone,
    });

    const newRefreshToken = await generateRefreshToken(
      payload.customerId,
      payload.businessId,
      payload.phone,
      deviceInfo
    );

    return customerApiResponse.success({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return customerApiResponse.error('Failed to refresh token');
  }
}