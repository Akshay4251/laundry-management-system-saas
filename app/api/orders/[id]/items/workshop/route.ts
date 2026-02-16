// app/api/orders/[id]/items/workshop/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { ItemStatus } from '@prisma/client';

interface SendToWorkshopInput {
  itemIds: string[];
  workshopPartnerName?: string;
  workshopNotes?: string;
}

// Statuses that CAN be sent to workshop
const ELIGIBLE_ITEM_STATUSES: ItemStatus[] = ['RECEIVED', 'IN_PROGRESS', 'READY'];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.notFound('Business not found');
    }

    const { id: orderId } = await params;
    const body: SendToWorkshopInput = await req.json();
    const { itemIds, workshopPartnerName, workshopNotes } = body;

    if (!itemIds || itemIds.length === 0) {
      return apiResponse.badRequest('No items selected');
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, businessId },
      include: { items: true },
    });

    if (!order) {
      return apiResponse.notFound('Order not found');
    }

    // Allow from IN_PROGRESS and READY statuses
    const allowedOrderStatuses = ['IN_PROGRESS', 'READY'];
    if (!allowedOrderStatuses.includes(order.status)) {
      return apiResponse.badRequest(
        `Cannot send items to workshop. Order must be in IN_PROGRESS or READY status (current: ${order.status})`
      );
    }

    // Find valid items from the request
    const validItems = order.items.filter((item) => {
      const isRequested = itemIds.includes(item.id);
      const hasEligibleStatus = ELIGIBLE_ITEM_STATUSES.includes(item.status);
      const notAlreadySent = !item.sentToWorkshop;
      
      return isRequested && hasEligibleStatus && notAlreadySent;
    });

    // Debug logging
    console.log('Workshop request:', {
      requestedItemIds: itemIds,
      orderItems: order.items.map(i => ({
        id: i.id,
        name: i.itemName,
        status: i.status,
        sentToWorkshop: i.sentToWorkshop,
      })),
      validItems: validItems.map(i => i.id),
    });

    if (validItems.length === 0) {
      // Provide detailed error message
      const reasons: string[] = [];
      
      for (const itemId of itemIds) {
        const item = order.items.find(i => i.id === itemId);
        if (!item) {
          reasons.push(`Item ${itemId}: not found in order`);
        } else if (item.sentToWorkshop) {
          reasons.push(`${item.itemName}: already at workshop`);
        } else if (!ELIGIBLE_ITEM_STATUSES.includes(item.status)) {
          reasons.push(`${item.itemName}: status is ${item.status}`);
        }
      }
      
      return apiResponse.badRequest(
        `No valid items to send. ${reasons.join('; ')}`
      );
    }

    const validItemIds = validItems.map(item => item.id);

    const result = await prisma.$transaction(async (tx) => {
      // Update items to AT_WORKSHOP
      await tx.orderItem.updateMany({
        where: { id: { in: validItemIds } },
        data: {
          status: 'AT_WORKSHOP',
          sentToWorkshop: true,
          workshopPartnerName: workshopPartnerName || 'External Workshop',
          workshopSentDate: new Date(),
          workshopNotes: workshopNotes || null,
          workshopReturnedDate: null,
        },
      });

      // Check if ALL items are now at workshop
      const updatedOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      const allItemsAtWorkshop = updatedOrder!.items.every(
        (item) => item.status === 'AT_WORKSHOP'
      );

      // Update order status to AT_WORKSHOP if all items are there
      if (allItemsAtWorkshop && order.status !== 'AT_WORKSHOP') {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'AT_WORKSHOP' },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: 'AT_WORKSHOP',
            changedBy: session.user?.id || 'system',
            notes: `All items sent to workshop: ${workshopPartnerName || 'External Workshop'}`,
          },
        });
      }

      return {
        itemsUpdated: validItemIds.length,
        itemsRequested: itemIds.length,
        allItemsAtWorkshop,
        orderStatus: allItemsAtWorkshop ? 'AT_WORKSHOP' : order.status,
      };
    });

    const message = result.itemsUpdated === result.itemsRequested
      ? `${result.itemsUpdated} item(s) sent to workshop`
      : `${result.itemsUpdated} of ${result.itemsRequested} item(s) sent to workshop`;

    return apiResponse.success(
      result,
      result.allItemsAtWorkshop 
        ? `${message}. Order moved to Workshop status.`
        : `${message}.`
    );
  } catch (error) {
    console.error('Error sending items to workshop:', error);
    return apiResponse.error('Failed to send items to workshop');
  }
}