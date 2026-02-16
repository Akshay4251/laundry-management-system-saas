// app/api/orders/[id]/payment/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentMode, PaymentStatus } from '@prisma/client';
import { createNotificationForBusiness } from '@/lib/notifications/create-notification';

// ============================================================================
// POST /api/orders/[id]/payment - Add Payment
// ============================================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const businessId = session.user.businessId!;
    const body = await req.json();

    const { amount, mode, reference, notes } = body;

    if (!amount || amount <= 0 || !mode) {
      return NextResponse.json(
        { error: 'Valid amount and payment mode are required' },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to business
    const existingOrder = await prisma.order.findFirst({
      where: { id, businessId },
      include: {
        customer: {
          select: { fullName: true },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const totalAmount = parseFloat(existingOrder.totalAmount.toString());
    const currentPaidAmount = parseFloat(existingOrder.paidAmount.toString());
    const dueAmount = totalAmount - currentPaidAmount;

    // Validate payment amount
    if (amount > dueAmount) {
      return NextResponse.json(
        {
          error: `Payment amount (${amount}) exceeds due amount (${dueAmount})`,
        },
        { status: 400 }
      );
    }

    // Add payment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: id,
          amount,
          mode: mode as PaymentMode,
          reference: reference || null,
          notes: notes || null,
        },
      });

      // Update order paid amount and payment status
      const newPaidAmount = currentPaidAmount + amount;
      let paymentStatus: PaymentStatus = 'UNPAID';

      if (newPaidAmount >= totalAmount) {
        paymentStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        paymentStatus = 'PARTIAL';
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus,
          paymentMode: mode as PaymentMode,
        },
        include: {
          customer: true,
          store: true,
          payments: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      return { payment, order: updatedOrder };
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 🔔 CREATE PAYMENT NOTIFICATION (Outside transaction)
    // ═══════════════════════════════════════════════════════════════════════

    try {
      if (amount > 0) {
        const newPaidAmount = currentPaidAmount + amount;
        const remainingDue = totalAmount - newPaidAmount;
        
        await createNotificationForBusiness({
          businessId,
          type: 'PAYMENT_RECEIVED',
          title: '💰 Payment received',
          message: remainingDue > 0
            ? `Payment of ₹${amount.toFixed(2)} received for Order #${existingOrder.orderNumber}. Remaining: ₹${remainingDue.toFixed(2)}`
            : `Full payment of ₹${amount.toFixed(2)} received for Order #${existingOrder.orderNumber}`,
          data: {
            orderId: existingOrder.id,
            orderNumber: existingOrder.orderNumber,
            paymentId: result.payment.id,
            amount: amount.toString(),
            mode,
            totalAmount: totalAmount.toString(),
            paidAmount: newPaidAmount.toString(),
            dueAmount: remainingDue.toString(),
            customerName: existingOrder.customer.fullName,
          },
        });
      }
    } catch (notifError) {
      console.error('Failed to create payment notification:', notifError);
      // Don't fail the payment if notification fails
    }

    return NextResponse.json({
      success: true,
      data: {
        payment: {
          id: result.payment.id,
          amount: parseFloat(result.payment.amount.toString()),
          mode: result.payment.mode,
          reference: result.payment.reference,
          notes: result.payment.notes,
          createdAt: result.payment.createdAt,
        },
        order: {
          id: result.order.id,
          orderNumber: result.order.orderNumber,
          totalAmount: parseFloat(result.order.totalAmount.toString()),
          paidAmount: parseFloat(result.order.paidAmount.toString()),
          dueAmount: parseFloat(result.order.totalAmount.toString()) - parseFloat(result.order.paidAmount.toString()),
          paymentStatus: result.order.paymentStatus,
          paymentMode: result.order.paymentMode,
          payments: result.order.payments,
        },
      },
      message: 'Payment added successfully',
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/orders/[id]/payment - Get Payment History
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const businessId = session.user.businessId!;

    // Verify order exists and belongs to business
    const order = await prisma.order.findFirst({
      where: { id, businessId },
      include: {
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const payments = order.payments.map((payment) => ({
      id: payment.id,
      amount: parseFloat(payment.amount.toString()),
      mode: payment.mode,
      reference: payment.reference,
      notes: payment.notes,
      createdAt: payment.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: parseFloat(order.totalAmount.toString()),
        paidAmount: parseFloat(order.paidAmount.toString()),
        dueAmount: parseFloat(order.totalAmount.toString()) - parseFloat(order.paidAmount.toString()),
        paymentStatus: order.paymentStatus,
        payments,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}