// app/api/settings/password/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { passwordUpdateSchema } from '@/lib/validations/settings';
import bcrypt from 'bcryptjs';

// PATCH /api/settings/password
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const validated = passwordUpdateSchema.parse(body);

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Verify current password
    const isValid = await bcrypt.compare(validated.currentPassword, user.passwordHash);
    if (!isValid) {
      return errorResponse('Current password is incorrect', 400);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validated.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return successResponse(null, 'Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
    return errorResponse('Failed to update password', 500);
  }
}