// app/api/super-admin/businesses/[id]/features/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const body = await req.json();

    console.log('Updating features for business:', id, body);

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id },
      include: { settings: true },
    });

    if (!business) {
      return apiResponse.notFound('Business not found');
    }

    // Extract valid feature fields
    const validFields = [
      'pickupEnabled',
      'deliveryEnabled',
      'workshopEnabled',
      'multiStoreEnabled',
    ];

    const updateData: Record<string, boolean> = {};
    for (const field of validFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    console.log('Update data:', updateData);

    // Upsert settings (create if doesn't exist, update if exists)
    const settings = await prisma.businessSettings.upsert({
      where: { businessId: id },
      update: updateData,
      create: {
        businessId: id,
        ...updateData,
      },
    });

    console.log('Updated settings:', settings);

    return apiResponse.success(settings, 'Features updated successfully');
  } catch (error) {
    console.error('Error updating features:', error);
    return apiResponse.error('Failed to update features');
  }
}