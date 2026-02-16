// app/api/service-icons/[id]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/service-icons/[id] - Remove icon from library
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;

    await prisma.serviceIcon.delete({
      where: { id },
    });

    return apiResponse.success(null, 'Icon removed from library');
  } catch (error) {
    console.error('DELETE /api/service-icons/[id] error:', error);
    return apiResponse.error('Failed to delete icon');
  }
}