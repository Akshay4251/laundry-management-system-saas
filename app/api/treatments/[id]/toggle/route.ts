// app/api/treatments/[id]/toggle/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// PATCH /api/treatments/[id]/toggle - Toggle treatment active status
// ============================================================================
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const businessId = session.user.businessId;

    // Check if treatment exists
    const existingTreatment = await prisma.treatment.findFirst({
      where: { id, businessId },
    });

    if (!existingTreatment) {
      return apiResponse.notFound('Treatment not found');
    }

    // Toggle the active status
    const treatment = await prisma.treatment.update({
      where: { id },
      data: {
        isActive: !existingTreatment.isActive,
      },
    });

    return apiResponse.success(
      {
        id: treatment.id,
        isActive: treatment.isActive,
      },
      `Treatment ${treatment.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    console.error('PATCH /api/treatments/[id]/toggle error:', error);
    return apiResponse.error('Failed to toggle treatment status');
  }
}