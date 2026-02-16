// app/api/super-admin/users/[id]/reset-password/route.ts

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.isSuperAdmin) return apiResponse.unauthorized();

    const { id } = await params;
    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return apiResponse.error('Password must be at least 6 characters');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiResponse.notFound('User not found');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id }, data: { passwordHash } });

    return apiResponse.success(null, 'Password reset successfully');
  } catch (error) {
    console.error('Reset password error:', error);
    return apiResponse.error('Failed to reset password');
  }
}