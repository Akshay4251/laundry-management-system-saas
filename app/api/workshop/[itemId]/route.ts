// app/api/workshop/[itemId]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ itemId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.notFound('Business not found');
    }

    const { itemId } = await params;
    const body = await req.json();
    const { action, notes } = body as { 
      action: 'mark_returned' | 'mark_ready' | 'return_to_store'; 
      notes?: string;
    };

    const item = await prisma.orderItem.findFirst({
      where: {
        id: itemId,
        order: { businessId },
        sentToWorkshop: true,
      },
      include: { 
        order: { include: { items: true } }
      },
    });

    if (!item) {
      return apiResponse.notFound('Workshop item not found');
    }

    let message = '';

    const result = await prisma.$transaction(async (tx) => {
      switch (action) {
        case 'mark_returned':
          // ✅ FIXED: Use correct Prisma enum
          if (item.status !== 'AT_WORKSHOP') {
            throw new Error('Item is not currently at workshop');
          }
          await tx.orderItem.update({
            where: { id: itemId },
            data: {
              status: 'WORKSHOP_RETURNED',  // ✅ FIXED
              workshopReturnedDate: new Date(),
              workshopNotes: notes 
                ? `${item.workshopNotes || ''}\n[Returned] ${notes}`.trim()
                : item.workshopNotes,
            },
          });
          message = 'Item marked as returned from workshop';
          break;

        case 'mark_ready':
          // ✅ FIXED: Check for WORKSHOP_RETURNED status
          if (item.status !== 'WORKSHOP_RETURNED') {
            throw new Error('Item must be in WORKSHOP_RETURNED status');
          }
          await tx.orderItem.update({
            where: { id: itemId },
            data: {
              status: 'READY',
              workshopNotes: notes 
                ? `${item.workshopNotes || ''}\n[QC Passed] ${notes}`.trim()
                : item.workshopNotes,
            },
          });
          message = 'Item QC passed, marked as ready';
          break;

        case 'return_to_store':
          // ✅ FIXED: Use correct status names
          if (!['AT_WORKSHOP', 'WORKSHOP_RETURNED'].includes(item.status)) {
            throw new Error('Item cannot be returned to store from current status');
          }
          await tx.orderItem.update({
            where: { id: itemId },
            data: {
              status: 'READY',
              workshopReturnedDate: item.workshopReturnedDate || new Date(),
            },
          });
          message = 'Item returned to store';
          break;

        default:
          throw new Error('Invalid action');
      }

      // Check if all items are ready
      const updatedOrderItems = await tx.orderItem.findMany({
        where: { orderId: item.orderId },
      });

      // ✅ FIXED: Use correct status names
      const allItemsReady = updatedOrderItems.every(
        (oi) => ['READY', 'COMPLETED'].includes(oi.status)
      );

      // Update order status if all items ready
      if (allItemsReady && ['AT_WORKSHOP', 'WORKSHOP_RETURNED', 'IN_PROGRESS'].includes(item.order.status)) {
        await tx.order.update({
          where: { id: item.orderId },
          data: { status: 'READY' },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: item.orderId,
            fromStatus: item.order.status,
            toStatus: 'READY',
            changedBy: session.user?.id || 'system',
            notes: 'Auto-updated: All items are ready',
          },
        });

        message += '. Order moved to Ready status.';
      }

      return { allItemsReady };
    });

    return apiResponse.success(
      { itemId, action, orderUpdated: result.allItemsReady },
      message
    );
  } catch (error) {
    console.error('Error updating workshop item:', error);
    if (error instanceof Error) {
      return apiResponse.badRequest(error.message);
    }
    return apiResponse.error('Failed to update workshop item');
  }
}