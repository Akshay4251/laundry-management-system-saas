// app/api/notifications/[id]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// PATCH /api/notifications/[id] - Mark as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const businessId = session.user.businessId;

    const notification = await prisma.notification.findFirst({
      where: { id, businessId: businessId! },
    });

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error('Error updating notification:', error);
    return errorResponse('Failed to update notification', 500);
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const businessId = session.user.businessId;

    await prisma.notification.deleteMany({
      where: { id, businessId: businessId! },
    });

    return successResponse(null, 'Notification deleted');
  } catch (error) {
    console.error('Error deleting notification:', error);
    return errorResponse('Failed to delete notification', 500);
  }
}