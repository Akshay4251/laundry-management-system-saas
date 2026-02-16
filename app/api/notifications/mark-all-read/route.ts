// app/api/notifications/mark-all-read/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// POST /api/notifications/mark-all-read
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('No business associated', 400);
    }

    await prisma.notification.updateMany({
      where: {
        businessId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return successResponse(null, 'All notifications marked as read');
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return errorResponse('Failed to mark notifications as read', 500);
  }
}