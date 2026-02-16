// app/api/super-admin/users/[id]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.isSuperAdmin) return apiResponse.unauthorized();

    const { id } = await params;

    // Check if user exists and is not an owner (protect business owners)
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiResponse.notFound('User not found');

    // Delete user
    await prisma.user.delete({ where: { id } });

    return apiResponse.success(null, 'User deleted');
  } catch (error) {
    console.error('Delete user error:', error);
    return apiResponse.error('Failed to delete user');
  }
}