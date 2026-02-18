// app/api/customer-app/orders/[id]/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';

// ============================================================================
// GET /api/customer-app/orders/[id] - Get single order details
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        customerId: customer.id,
        businessId: customer.businessId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        items: {
          select: {
            id: true,
            tagNumber: true,
            itemName: true,
            serviceName: true,
            quantity: true,
            status: true,
            unitPrice: true,
            subtotal: true,
            isExpress: true,
            color: true,
            brand: true,
            notes: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            mode: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            notes: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return customerApiResponse.notFound('Order not found');
    }

    // Transform order
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMode: order.paymentMode,
      priority: order.priority,
      isExpress: order.priority === 'EXPRESS',
      store: order.store,
      items: order.items.map((item) => ({
        id: item.id,
        tagNumber: item.tagNumber,
        itemName: item.itemName,
        serviceName: item.serviceName,
        quantity: item.quantity,
        status: item.status,
        unitPrice: parseFloat(item.unitPrice.toString()),
        subtotal: parseFloat(item.subtotal.toString()),
        isExpress: item.isExpress,
        color: item.color,
        brand: item.brand,
        notes: item.notes,
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        amount: parseFloat(payment.amount.toString()),
        mode: payment.mode,
        createdAt: payment.createdAt.toISOString(),
      })),
      statusHistory: order.statusHistory.map((history) => ({
        id: history.id,
        fromStatus: history.fromStatus,
        toStatus: history.toStatus,
        notes: history.notes,
        createdAt: history.createdAt.toISOString(),
      })),
      itemsCount: order.items.length,
      totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: order.subtotal ? parseFloat(order.subtotal.toString()) : null,
      gstEnabled: order.gstEnabled,
      gstPercentage: order.gstPercentage ? parseFloat(order.gstPercentage.toString()) : null,
      gstAmount: order.gstAmount ? parseFloat(order.gstAmount.toString()) : null,
      discount: order.discount ? parseFloat(order.discount.toString()) : null,
      totalAmount: parseFloat(order.totalAmount.toString()),
      paidAmount: parseFloat(order.paidAmount.toString()),
      dueAmount: parseFloat(order.totalAmount.toString()) - parseFloat(order.paidAmount.toString()),
      pickupDate: order.pickupDate?.toISOString() || null,
      deliveryDate: order.deliveryDate?.toISOString() || null,
      completedDate: order.completedDate?.toISOString() || null,
      specialInstructions: order.specialInstructions,
      isRework: order.isRework,
      reworkCount: order.reworkCount,
      reworkReason: order.reworkReason,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    return customerApiResponse.success({ order: transformedOrder });
  } catch (error) {
    console.error('Get order error:', error);
    return customerApiResponse.error('Failed to fetch order');
  }
}

// ============================================================================
// DELETE /api/customer-app/orders/[id] - Cancel pickup order
// ============================================================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const { id } = await params;

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        id,
        customerId: customer.id,
        businessId: customer.businessId,
      },
    });

    if (!order) {
      return customerApiResponse.notFound('Order not found');
    }

    // Only allow cancelling PICKUP status orders
    if (order.status !== 'PICKUP') {
      return customerApiResponse.badRequest(
        'Only pending pickup orders can be cancelled. Please contact the store for other orders.'
      );
    }

    // Cancel order
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
          changedBy: 'customer-app',
          notes: 'Cancelled by customer via app',
        },
      });
    });

    return customerApiResponse.success(
      { id, status: 'CANCELLED' },
      'Pickup cancelled successfully'
    );
  } catch (error) {
    console.error('Cancel order error:', error);
    return customerApiResponse.error('Failed to cancel order');
  }
}