// app/api/orders/[id]/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse, handlePrismaError } from '@/lib/api-response';
import { OrderStatus, Prisma } from '@prisma/client';

// ============================================================================
// GET /api/orders/[id] - Get single order with full details
// ============================================================================

export async function GET(
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

    const order = await prisma.order.findFirst({
      where: { id, businessId },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            address: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        // Customer address linked to this order
        customerAddress: {
          select: {
            id: true,
            label: true,
            fullAddress: true,
            landmark: true,
            city: true,
            pincode: true,
            latitude: true,
            longitude: true,
          },
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                iconUrl: true,
                category: true,
              },
            },
            treatment: {
              select: {
                id: true,
                name: true,
                code: true,
                turnaroundHours: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return apiResponse.notFound('Order not found');
    }

    // Calculate stats
    const stats = {
      totalItems: order.items.length,
      totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      workshopItems: order.items.filter((item) => item.sentToWorkshop).length,
      completedItems: order.items.filter((item) => item.status === 'COMPLETED').length,
      inProgressItems: order.items.filter((item) => item.status === 'IN_PROGRESS').length,
      atWorkshopItems: order.items.filter((item) => item.status === 'AT_WORKSHOP').length,
      readyItems: order.items.filter((item) => item.status === 'READY').length,
    };

    // Transform items
    const transformedItems = order.items.map((item) => ({
      id: item.id,
      tagNumber: item.tagNumber,
      itemId: item.itemId,
      itemName: item.itemName,
      itemIcon: item.item?.iconUrl || null,
      itemCategory: item.item?.category || null,
      treatmentId: item.treatmentId,
      treatmentName: item.treatmentName || item.treatment?.name || null,
      treatmentCode: item.treatment?.code || null,
      turnaroundHours: item.treatment?.turnaroundHours || null,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice.toString()),
      subtotal: parseFloat(item.subtotal.toString()),
      isExpress: item.isExpress,
      status: item.status,
      color: item.color,
      brand: item.brand,
      notes: item.notes,
      sentToWorkshop: item.sentToWorkshop,
      workshopPartnerName: item.workshopPartnerName,
      workshopSentDate: item.workshopSentDate?.toISOString() || null,
      workshopReturnedDate: item.workshopReturnedDate?.toISOString() || null,
      workshopNotes: item.workshopNotes,
    }));

    // Transform payments
    const transformedPayments = order.payments.map((payment) => ({
      id: payment.id,
      amount: parseFloat(payment.amount.toString()),
      mode: payment.mode,
      reference: payment.reference,
      notes: payment.notes,
      createdAt: payment.createdAt.toISOString(),
    }));

    // Transform status history
    const transformedHistory = order.statusHistory.map((history) => ({
      id: history.id,
      fromStatus: history.fromStatus,
      toStatus: history.toStatus,
      changedBy: history.changedBy,
      notes: history.notes,
      createdAt: history.createdAt.toISOString(),
    }));

    const response = {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMode: order.paymentMode,
      priority: order.priority,
      isExpress: order.priority === 'EXPRESS',
      customer: order.customer,
      store: order.store,

      // Driver assignment
      driverId: order.driverId,
      driver: order.driver
        ? {
            id: order.driver.id,
            fullName: order.driver.fullName,
            phone: order.driver.phone,
            email: order.driver.email,
          }
        : null,

      // Customer address linked to this order
      address: order.customerAddress
        ? {
            id: order.customerAddress.id,
            label: order.customerAddress.label,
            fullAddress: order.customerAddress.fullAddress,
            landmark: order.customerAddress.landmark,
            city: order.customerAddress.city,
            pincode: order.customerAddress.pincode,
            latitude: order.customerAddress.latitude,
            longitude: order.customerAddress.longitude,
          }
        : null,

      totalAmount: parseFloat(order.totalAmount.toString()),
      paidAmount: parseFloat(order.paidAmount.toString()),
      discount: order.discount ? parseFloat(order.discount.toString()) : null,
      tax: order.tax ? parseFloat(order.tax.toString()) : null,
      dueAmount: parseFloat(order.totalAmount.toString()) - parseFloat(order.paidAmount.toString()),
      subtotal: order.totalAmount
        ? parseFloat(order.totalAmount.toString()) -
          (order.tax ? parseFloat(order.tax.toString()) : 0) +
          (order.discount ? parseFloat(order.discount.toString()) : 0)
        : null,
      pickupDate: order.pickupDate?.toISOString() || null,
      deliveryDate: order.deliveryDate?.toISOString() || null,
      completedDate: order.completedDate?.toISOString() || null,
      specialInstructions: order.specialInstructions,
      assignedTo: order.assignedTo,
      isRework: order.isRework,
      reworkCount: order.reworkCount,
      reworkReason: order.reworkReason,
      items: transformedItems,
      payments: transformedPayments,
      statusHistory: transformedHistory,
      stats,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    return apiResponse.success(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to fetch order');
  }
}

// ============================================================================
// DELETE /api/orders/[id] - Cancel order
// ============================================================================

export async function DELETE(
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

    // Get order
    const order = await prisma.order.findFirst({
      where: { id, businessId },
    });

    if (!order) {
      return apiResponse.notFound('Order not found');
    }

    const cancellableStatuses: OrderStatus[] = [
      'PICKUP',
      'IN_PROGRESS',
      'AT_WORKSHOP',
      'WORKSHOP_RETURNED',
      'READY',
    ];

    if (!cancellableStatuses.includes(order.status)) {
      return apiResponse.badRequest(
        `Cannot cancel order in ${order.status} status. Only orders in ` +
          `${cancellableStatuses.join(', ')} can be cancelled.`
      );
    }

    // Cancel order in transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: 'CANCELLED',
          changedBy: session.user?.id || session.user?.email || 'system',
          notes: 'Order cancelled by user',
        },
      });

      if (order.customerId) {
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

    return apiResponse.success({ id, status: 'CANCELLED' }, 'Order cancelled successfully');
  } catch (error) {
    console.error('Error cancelling order:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return apiResponse.error('Failed to cancel order');
  }
}