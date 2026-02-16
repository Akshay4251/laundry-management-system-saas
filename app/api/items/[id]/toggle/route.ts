// app/api/items/[id]/toggle/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    const { id } = await params;

    const item = await prisma.item.findFirst({
      where: { id, businessId, deletedAt: null },
    });

    if (!item) {
      return apiResponse.notFound('Item not found');
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: { isActive: !item.isActive },
    });

    return apiResponse.success(
      { id: updatedItem.id, isActive: updatedItem.isActive },
      `Item ${updatedItem.isActive ? 'activated' : 'deactivated'}`
    );
  } catch (error) {
    console.error('PATCH /api/items/[id]/toggle error:', error);
    return apiResponse.error('Failed to toggle item status');
  }
}