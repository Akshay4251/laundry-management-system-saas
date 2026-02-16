// app/api/settings/business/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';

// Validation Schema
const businessSettingsSchema = z.object({
  businessName: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  gstNumber: z.string().max(15).optional().nullable(),
  address: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  gstEnabled: z.boolean().optional(),
  gstPercentage: z.number().min(0).max(100).optional(),
});

// GET /api/settings/business
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('No business associated', 400);
    }

    const [business, settings] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          businessName: true,
          email: true,
          phone: true,
          address: true,
          logoUrl: true,
          gstNumber: true,
          planType: true,
          planStatus: true,
        },
      }),
      prisma.businessSettings.findUnique({
        where: { businessId },
        select: {
          id: true,
          businessId: true,
          gstEnabled: true,
          gstPercentage: true,
          currency: true,
          timezone: true,
        },
      }),
    ]);

    return successResponse({ 
      business, 
      settings: settings ? {
        ...settings,
        gstPercentage: settings.gstPercentage ? parseFloat(settings.gstPercentage.toString()) : 18,
      } : null 
    });
  } catch (error) {
    console.error('Error fetching business settings:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}

// PATCH /api/settings/business
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    if (!['OWNER', 'ADMIN'].includes(session.user.role)) {
      return errorResponse('Permission denied', 403);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('No business associated', 400);
    }

    const body = await req.json();
    const validated = businessSettingsSchema.parse(body);

    // Separate business fields from settings fields
    const { gstEnabled, gstPercentage, ...businessFields } = validated;

    // Update business
    if (Object.keys(businessFields).length > 0) {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          ...(businessFields.businessName && { businessName: businessFields.businessName }),
          ...(businessFields.email !== undefined && { email: businessFields.email }),
          ...(businessFields.phone !== undefined && { phone: businessFields.phone }),
          ...(businessFields.gstNumber !== undefined && { gstNumber: businessFields.gstNumber }),
          ...(businessFields.address !== undefined && { address: businessFields.address }),
          ...(businessFields.logoUrl !== undefined && { logoUrl: businessFields.logoUrl }),
        },
      });
    }

    // Update or create settings for GST
    if (gstEnabled !== undefined || gstPercentage !== undefined) {
      await prisma.businessSettings.upsert({
        where: { businessId },
        update: {
          ...(gstEnabled !== undefined && { gstEnabled }),
          ...(gstPercentage !== undefined && { gstPercentage }),
        },
        create: {
          businessId,
          gstEnabled: gstEnabled ?? false,
          gstPercentage: gstPercentage ?? 18,
        },
      });
    }

    return successResponse(null, 'Settings updated successfully');
  } catch (error) {
    console.error('Error updating business settings:', error);
    return errorResponse('Failed to update settings', 500);
  }
}