// app/api/delivery-app/auth/logout/route.ts

import { NextRequest } from 'next/server';
import { driverApiResponse, handleDriverCorsPreflightRequest } from '@/lib/driver-api-response';
import { invalidateDriverRefreshToken } from '@/lib/driver-jwt';

export async function OPTIONS() {
  return handleDriverCorsPreflightRequest();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (refreshToken) {
      await invalidateDriverRefreshToken(refreshToken);
    }

    return driverApiResponse.success(null, 'Logged out successfully');
  } catch (error) {
    console.error('Driver logout error:', error);
    return driverApiResponse.error('Failed to logout');
  }
}