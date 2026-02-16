// app/api/settings/preferences/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';

// Schema matching your current Prisma model
const preferencesSchema = z.object({
  // Notification preferences (only fields that exist in schema)
  notifyNewOrders: z.boolean().optional(),
  notifyOrderComplete: z.boolean().optional(),
  notifyLowStock: z.boolean().optional(),
  notifyMarketing: z.boolean().optional(),
});

// GET /api/settings/preferences
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Return default preferences if none exist
    if (!preferences) {
      return successResponse({
        id: '',
        userId: session.user.id,
        theme: 'light',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        compactMode: false,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notifyNewOrders: true,
        notifyOrderComplete: true,
        notifyLowStock: true,
        notifyMarketing: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return successResponse(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return errorResponse('Failed to fetch preferences', 500);
  }
}

// PATCH /api/settings/preferences
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const validated = preferencesSchema.parse(body);

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: validated,
      create: {
        userId: session.user.id,
        notifyNewOrders: validated.notifyNewOrders ?? true,
        notifyOrderComplete: validated.notifyOrderComplete ?? true,
        notifyLowStock: validated.notifyLowStock ?? true,
        notifyMarketing: validated.notifyMarketing ?? false,
      },
    });

    return successResponse(preferences, 'Preferences updated successfully');
  } catch (error) {
    console.error('Error updating preferences:', error);
    return errorResponse('Failed to update preferences', 500);
  }
}