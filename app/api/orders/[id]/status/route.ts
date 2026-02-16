// app/api/orders/[id]/status/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus, ItemStatus, Prisma } from '@prisma/client';
import { apiResponse, handlePrismaError } from '@/lib/api-response';
import { createNotificationForBusiness } from '@/lib/notifications/create-notification';
import { sendPushNotificationToCustomer } from '@/lib/expo-push';

// ============================================================================
// STATUS TRANSITION MATRIX - Single Source of Truth
// ============================================================================

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PICKUP: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['READY', 'AT_WORKSHOP', 'CANCELLED'],
  AT_WORKSHOP: ['WORKSHOP_RETURNED', 'IN_PROGRESS', 'CANCELLED'],
  WORKSHOP_RETURNED: ['READY', 'IN_PROGRESS', 'AT_WORKSHOP'],
  READY: ['OUT_FOR_DELIVERY', 'COMPLETED', 'IN_PROGRESS', 'AT_WORKSHOP', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['COMPLETED', 'READY'],
  COMPLETED: ['IN_PROGRESS'],
  CANCELLED: [],
};

const ORDER_TO_ITEM_STATUS: Record<OrderStatus, ItemStatus | null> = {
  PICKUP: 'RECEIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  AT_WORKSHOP: 'AT_WORKSHOP',
  WORKSHOP_RETURNED: 'WORKSHOP_RETURNED',
  READY: 'READY',
  OUT_FOR_DELIVERY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: null,
};

// ============================================================================
// CUSTOMER PUSH NOTIFICATION MESSAGES
// ============================================================================

const CUSTOMER_PUSH_MESSAGES: Record<OrderStatus, { title: string; body: (orderNumber: string) => string } | null> = {
  PICKUP: null,
  IN_PROGRESS: {
    title: '🧺 Items Received!',
    body: (orderNumber) => `Your items for order #${orderNumber} have been received and processing has started.`,
  },
  AT_WORKSHOP: {
    title: '🏭 At Workshop',
    body: (orderNumber) => `Your order #${orderNumber} has been sent to our expert workshop for special care.`,
  },
  WORKSHOP_RETURNED: null, // Internal status, don't notify customer
  READY: {
    title: '✅ Order Ready!',
    body: (orderNumber) => `Great news! Your order #${orderNumber} is ready for pickup/delivery.`,
  },
  OUT_FOR_DELIVERY: {
    title: '🚚 On the Way!',
    body: (orderNumber) => `Your order #${orderNumber} is out for delivery. We'll be there soon!`,
  },
  COMPLETED: {
    title: '🎉 Order Completed!',
    body: (orderNumber) => `Your order #${orderNumber} has been delivered. Thank you for choosing us!`,
  },
  CANCELLED: {
    title: '❌ Order Cancelled',
    body: (orderNumber) => `Your order #${orderNumber} has been cancelled. Contact us for any questions.`,
  },
};

interface UpdateStatusInput {
  status: OrderStatus;
  notes?: string;
  reason?: string;
  workshopPartnerName?: string;
  workshopNotes?: string;
}

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

    const { id } = await params;
    const body: UpdateStatusInput = await req.json();

    const { 
      status: newStatus, 
      notes, 
      reason,
      workshopPartnerName,
      workshopNotes,
    } = body;

    if (!newStatus || !Object.keys(VALID_TRANSITIONS).includes(newStatus)) {
      return apiResponse.badRequest('Invalid status provided');
    }

    const order = await prisma.order.findFirst({
      where: { id, businessId },
      include: { 
        items: true,
        customer: { select: { id: true, fullName: true, phone: true, expoPushToken: true, pushEnabled: true } }
      },
    });

    if (!order) {
      return apiResponse.notFound('Order not found');
    }

    const currentStatus = order.status;

    // Validate transition
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      return apiResponse.badRequest(
        `Cannot transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed: ${allowedTransitions.join(', ') || 'none'}`
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BUSINESS RULE VALIDATIONS
    // ═══════════════════════════════════════════════════════════════════════

    // Payment validation for COMPLETED
    if (newStatus === 'COMPLETED') {
      const totalAmount = parseFloat(order.totalAmount.toString());
      const paidAmount = parseFloat(order.paidAmount.toString());
      
      if (paidAmount < totalAmount) {
        return apiResponse.badRequest(
          `Cannot mark as completed. Outstanding balance: ₹${(totalAmount - paidAmount).toFixed(2)}`
        );
      }
    }

    // Validate no items at workshop when marking READY
    if (newStatus === 'READY') {
      const itemsAtWorkshop = order.items.filter(
        item => item.status === 'AT_WORKSHOP'
      );
      
      if (itemsAtWorkshop.length > 0) {
        return apiResponse.badRequest(
          `Cannot mark as ready. ${itemsAtWorkshop.length} item(s) still at workshop. ` +
          `Please wait for workshop items to return first.`
        );
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DETERMINE TRANSITION TYPE
    // ═══════════════════════════════════════════════════════════════════════

    const isReworking = currentStatus === 'COMPLETED' && newStatus === 'IN_PROGRESS';
    const isMovingToWorkshop = newStatus === 'AT_WORKSHOP' && 
      ['IN_PROGRESS', 'READY'].includes(currentStatus);
    const isReturningFromWorkshop = currentStatus === 'AT_WORKSHOP' && newStatus === 'WORKSHOP_RETURNED';
    const isQCPassed = currentStatus === 'WORKSHOP_RETURNED' && newStatus === 'READY';
    const isQCFailed = currentStatus === 'WORKSHOP_RETURNED' && newStatus === 'IN_PROGRESS';
    const isGoingBackToWorkshop = currentStatus === 'WORKSHOP_RETURNED' && newStatus === 'AT_WORKSHOP';
    const isCompleting = newStatus === 'COMPLETED';
    const isCancelling = newStatus === 'CANCELLED';

    await prisma.$transaction(async (tx) => {
      const updateData: Prisma.OrderUpdateInput = {
        status: newStatus,
      };

      // Handle COMPLETED
      if (isCompleting) {
        updateData.completedDate = new Date();
        updateData.paymentStatus = 'PAID';
      }

      // Handle REWORK
      if (isReworking) {
        updateData.completedDate = null;
        updateData.isRework = true;
        updateData.reworkCount = { increment: 1 };
        if (reason) {
          updateData.reworkReason = reason;
        }
        
        await tx.orderItem.updateMany({
          where: { orderId: id },
          data: {
            status: 'IN_PROGRESS',
            sentToWorkshop: false,
            workshopReturnedDate: null,
            workshopSentDate: null,
            workshopPartnerName: null,
            workshopNotes: null,
          },
        });
      }

      // Handle MOVING TO WORKSHOP
      if (isMovingToWorkshop) {
        await tx.orderItem.updateMany({
          where: { orderId: id },
          data: {
            status: 'AT_WORKSHOP',
            sentToWorkshop: true,
            workshopPartnerName: workshopPartnerName || 'External Workshop',
            workshopSentDate: new Date(),
            workshopReturnedDate: null,
            workshopNotes: workshopNotes || null,
          },
        });
      }

      // Handle GOING BACK TO WORKSHOP
      if (isGoingBackToWorkshop) {
        await tx.orderItem.updateMany({
          where: { orderId: id },
          data: {
            status: 'AT_WORKSHOP',
            workshopSentDate: new Date(),
            workshopReturnedDate: null,
          },
        });
      }

      // Handle WORKSHOP RETURNED
      if (isReturningFromWorkshop) {
        await tx.orderItem.updateMany({
          where: { orderId: id },
          data: {
            status: 'WORKSHOP_RETURNED',
            workshopReturnedDate: new Date(),
          },
        });
      }

      // Handle QC PASSED
      if (isQCPassed) {
        await tx.orderItem.updateMany({
          where: { orderId: id },
          data: { status: 'READY' },
        });
      }

      // Handle QC FAILED
      if (isQCFailed) {
        await tx.orderItem.updateMany({
          where: { orderId: id },
          data: {
            status: 'IN_PROGRESS',
            sentToWorkshop: false,
            workshopReturnedDate: null,
            workshopSentDate: null,
          },
        });
      }

      // Handle other transitions
      if (!isReworking && !isMovingToWorkshop && !isReturningFromWorkshop && 
          !isQCPassed && !isQCFailed && !isGoingBackToWorkshop && !isCancelling) {
        
        const newItemStatus = ORDER_TO_ITEM_STATUS[newStatus];
        if (newItemStatus) {
          await tx.orderItem.updateMany({
            where: { orderId: id },
            data: { status: newItemStatus },
          });
        }
      }

      // Update Order
      await tx.order.update({
        where: { id },
        data: updateData,
      });

      // Create Status History
      let historyNotes = notes || getDefaultStatusNote(currentStatus, newStatus);
      if (isReworking && reason) {
        historyNotes = `Rework reason: ${reason}. ${historyNotes}`;
      }
      if (isMovingToWorkshop && workshopPartnerName) {
        historyNotes = `Sent to: ${workshopPartnerName}. ${historyNotes}`;
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: currentStatus,
          toStatus: newStatus,
          changedBy: session.user?.id || session.user?.email || 'system',
          notes: historyNotes,
        },
      });

      // Handle CANCELLATION
      if (isCancelling && order.customerId) {
        const totalAmount = parseFloat(order.totalAmount.toString());
        await tx.customer.update({
          where: { id: order.customerId },
          data: {
            totalOrders: { decrement: 1 },
            totalSpent: { decrement: totalAmount },
          },
        });
      }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 🔔 CREATE BUSINESS NOTIFICATIONS (Outside transaction)
    // ═══════════════════════════════════════════════════════════════════════

    try {
      // READY notification
      if (newStatus === 'READY') {
        await createNotificationForBusiness({
          businessId,
          type: 'ORDER_READY',
          title: '🔔 Order ready for pickup',
          message: `Order #${order.orderNumber} for ${order.customer.fullName} is ready`,
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customer.id,
            customerName: order.customer.fullName,
            previousStatus: currentStatus,
          },
        });
      }

      // COMPLETED notification
      if (isCompleting) {
        const totalAmount = parseFloat(order.totalAmount.toString());
        await createNotificationForBusiness({
          businessId,
          type: 'ORDER_COMPLETED',
          title: '✅ Order completed',
          message: `Order #${order.orderNumber} for ${order.customer.fullName} has been completed - ₹${totalAmount.toFixed(2)}`,
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customer.id,
            customerName: order.customer.fullName,
            totalAmount: totalAmount.toString(),
          },
        });
      }
    } catch (notifError) {
      console.error('Failed to create business notification:', notifError);
      // Don't fail the status update if notification fails
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📱 SEND CUSTOMER PUSH NOTIFICATION (Outside transaction)
    // ═══════════════════════════════════════════════════════════════════════

    try {
      const pushMessage = CUSTOMER_PUSH_MESSAGES[newStatus];
      
      if (pushMessage && order.customer.expoPushToken && order.customer.pushEnabled) {
        await sendPushNotificationToCustomer(
          order.customerId,
          pushMessage.title,
          pushMessage.body(order.orderNumber),
          {
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: newStatus,
            type: 'ORDER_STATUS_UPDATE',
          }
        );
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📱 Push notification sent to customer for order #${order.orderNumber}: ${newStatus}`);
        }
      }
    } catch (pushError) {
      console.error('Failed to send customer push notification:', pushError);
      // Don't fail the status update if push notification fails
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FETCH AND RETURN UPDATED ORDER
    // ═══════════════════════════════════════════════════════════════════════

    const completeOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        store: { select: { id: true, name: true } },
        items: { select: { id: true, status: true, itemName: true, sentToWorkshop: true } },
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    return apiResponse.success(
      {
        id: completeOrder!.id,
        orderNumber: completeOrder!.orderNumber,
        status: completeOrder!.status,
        previousStatus: currentStatus,
        isRework: completeOrder!.isRework,
        reworkCount: completeOrder!.reworkCount,
        paymentStatus: completeOrder!.paymentStatus,
        customer: completeOrder!.customer,
        store: completeOrder!.store,
        items: completeOrder!.items,
        statusHistory: completeOrder!.statusHistory,
        completedDate: completeOrder!.completedDate,
        updatedAt: completeOrder!.updatedAt,
      },
      getStatusUpdateMessage(currentStatus, newStatus, isReworking)
    );
  } catch (error) {
    console.error('Error updating order status:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to update order status');
  }
}

function getDefaultStatusNote(from: OrderStatus, to: OrderStatus): string {
  const notes: Record<string, string> = {
    'PICKUP->IN_PROGRESS': 'Items picked up from customer and received at store',
    'PICKUP->CANCELLED': 'Pickup request cancelled',
    'IN_PROGRESS->READY': 'Processing completed, order ready for customer',
    'IN_PROGRESS->AT_WORKSHOP': 'All items sent to external workshop',
    'IN_PROGRESS->CANCELLED': 'Order cancelled during processing',
    'AT_WORKSHOP->WORKSHOP_RETURNED': 'All items received back from workshop',
    'AT_WORKSHOP->IN_PROGRESS': 'Items recalled from workshop, processing in-house',
    'AT_WORKSHOP->CANCELLED': 'Order cancelled while at workshop',
    'WORKSHOP_RETURNED->READY': 'Quality check passed, order ready for customer',
    'WORKSHOP_RETURNED->IN_PROGRESS': 'Quality check failed, sent back for rework',
    'WORKSHOP_RETURNED->AT_WORKSHOP': 'Sent back to workshop for corrections',
    'READY->OUT_FOR_DELIVERY': 'Order dispatched for home delivery',
    'READY->COMPLETED': 'Customer picked up order from store',
    'READY->IN_PROGRESS': 'Order sent back for additional processing',
    'READY->AT_WORKSHOP': 'Order sent to workshop for reprocessing',
    'READY->CANCELLED': 'Order cancelled before delivery',
    'OUT_FOR_DELIVERY->COMPLETED': 'Order successfully delivered to customer',
    'OUT_FOR_DELIVERY->READY': 'Delivery attempt failed, order returned to store',
    'COMPLETED->IN_PROGRESS': 'Order returned for reprocessing due to quality issue',
  };

  return notes[`${from}->${to}`] || `Status changed from ${from} to ${to}`;
}

function getStatusUpdateMessage(from: OrderStatus, to: OrderStatus, isRework: boolean): string {
  if (isRework) {
    return 'Order sent for reprocessing. All items reset to processing status.';
  }

  const messages: Record<string, string> = {
    'PICKUP->IN_PROGRESS': '✅ Items received! Processing started.',
    'IN_PROGRESS->READY': '✅ Order is ready for customer!',
    'IN_PROGRESS->AT_WORKSHOP': '📦 All items sent to workshop.',
    'AT_WORKSHOP->WORKSHOP_RETURNED': '📦 Items received from workshop. Please QC.',
    'WORKSHOP_RETURNED->READY': '✅ QC passed! Order ready for customer.',
    'WORKSHOP_RETURNED->IN_PROGRESS': '⚠️ QC failed. Order sent back for rework.',
    'READY->OUT_FOR_DELIVERY': '🚚 Order out for delivery!',
    'READY->COMPLETED': '✅ Order completed! Customer received items.',
    'READY->AT_WORKSHOP': '📦 Order sent back to workshop.',
    'OUT_FOR_DELIVERY->COMPLETED': '✅ Delivered successfully!',
    'OUT_FOR_DELIVERY->READY': '⚠️ Delivery failed. Order back at store.',
  };

  return messages[`${from}->${to}`] || `Status updated to ${to}`;
}