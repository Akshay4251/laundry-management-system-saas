// app/api/notifications/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import type { NotificationType } from '@prisma/client';

// GET /api/notifications - List notifications
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('No business associated', 400);
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const unreadOnly = searchParams.get('unread') === 'true';
    const type = searchParams.get('type') as NotificationType | null;
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      businessId,
    };
    
    if (unreadOnly) {
      where.isRead = false;
    }
    
    if (type) {
      where.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { businessId, isRead: false },
      }),
    ]);

    return successResponse({
      notifications,
      stats: {
        total,
        unread: unreadCount,
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}