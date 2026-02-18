// app/api/services/[id]/toggle/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// PATCH /api/services/[id]/toggle - Toggle service active status
// ============================================================================
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const businessId = session.user.businessId;

    // Check if service exists
    const existingService = await prisma.service.findFirst({
      where: { id, businessId },
    });

    if (!existingService) {
      return apiResponse.notFound('Service not found');
    }

    // Toggle the active status
    const service = await prisma.service.update({
      where: { id },
      data: {
        isActive: !existingService.isActive,
      },
    });

    return apiResponse.success(
      {
        id: service.id,
        isActive: service.isActive,
      },
      `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    console.error('PATCH /api/services/[id]/toggle error:', error);
    return apiResponse.error('Failed to toggle service status');
  }
}