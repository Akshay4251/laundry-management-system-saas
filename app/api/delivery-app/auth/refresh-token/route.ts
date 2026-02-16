// app/api/delivery-app/auth/refresh-token/route.ts

import { NextRequest } from 'next/server';
import { driverApiResponse, handleDriverCorsPreflightRequest } from '@/lib/driver-api-response';
import {
  verifyDriverRefreshToken,
  generateDriverAccessToken,
  generateDriverRefreshToken,
  invalidateDriverRefreshToken,
} from '@/lib/driver-jwt';

export async function OPTIONS() {
  return handleDriverCorsPreflightRequest();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken, deviceInfo } = body;

    if (!refreshToken) {
      return driverApiResponse.badRequest('Refresh token is required');
    }

    const payload = await verifyDriverRefreshToken(refreshToken);
    if (!payload) {
      return driverApiResponse.unauthorized('Invalid or expired refresh token');
    }

    await invalidateDriverRefreshToken(refreshToken);

    const newAccessToken = generateDriverAccessToken({
      driverId: payload.driverId,
      businessId: payload.businessId,
      phone: payload.phone,
      email: payload.email,
    });

    const newRefreshToken = await generateDriverRefreshToken(payload.driverId, deviceInfo);

    return driverApiResponse.success({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return driverApiResponse.error('Failed to refresh token');
  }
}