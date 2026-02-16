// app/api/customer-app/auth/logout/route.ts

import { NextRequest } from 'next/server';
import { customerApiResponse } from '@/lib/customer-api-response';
import { invalidateRefreshToken } from '@/lib/customer-jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (refreshToken) {
      await invalidateRefreshToken(refreshToken);
    }

    return customerApiResponse.success(null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    return customerApiResponse.error('Failed to logout');
  }
}