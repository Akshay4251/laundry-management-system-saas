// app/api/settings/profile/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { profileUpdateSchema } from '@/lib/validations/settings';

// GET /api/settings/profile
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return errorResponse('Failed to fetch profile', 500);
  }
}

// PATCH /api/settings/profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const validated = profileUpdateSchema.parse(body);

    // Check email uniqueness if changing
    if (validated.email && validated.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email },
      });
      if (existingUser) {
        return errorResponse('Email already in use', 400);
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: validated,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    return successResponse(updated, 'Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    return errorResponse('Failed to update profile', 500);
  }
}