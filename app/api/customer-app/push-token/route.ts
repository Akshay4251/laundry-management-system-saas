// app/api/customer-app/push-token/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';

// ============================================================================
// POST /api/customer-app/push-token - Register Expo push token
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const body = await req.json();
    const { expoPushToken, enabled } = body;

    if (!expoPushToken) {
      return customerApiResponse.badRequest('Push token is required');
    }

    // Validate Expo push token format
    if (!expoPushToken.startsWith('ExponentPushToken[') && !expoPushToken.startsWith('ExpoPushToken[')) {
      return customerApiResponse.badRequest('Invalid push token format');
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        expoPushToken,
        pushEnabled: enabled !== false,
      },
    });

    return customerApiResponse.success(null, 'Push token registered successfully');
  } catch (error) {
    console.error('Register push token error:', error);
    return customerApiResponse.error('Failed to register push token');
  }
}

// ============================================================================
// DELETE /api/customer-app/push-token - Unregister push token
// ============================================================================

export async function DELETE(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        expoPushToken: null,
        pushEnabled: false,
      },
    });

    return customerApiResponse.success(null, 'Push token unregistered successfully');
  } catch (error) {
    console.error('Unregister push token error:', error);
    return customerApiResponse.error('Failed to unregister push token');
  }
}