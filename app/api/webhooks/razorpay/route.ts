// app/api/webhooks/razorpay/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature, calculateSubscriptionDates } from '@/lib/razorpay';
import { getPlanLimits, getPlanFeatures } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('Missing Razorpay signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error('Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    console.log(`📥 Razorpay webhook: ${eventType}`);

    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case 'refund.created':
        await handleRefundCreated(event.payload.refund.entity);
        break;

      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity, event.payload.payment.entity);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentCaptured(payment: any) {
  const { id: paymentId, order_id: orderId, amount, method, notes } = payment;

  console.log(`✅ Payment captured: ${paymentId} for order ${orderId}`);

  // Find the payment record
  const paymentRecord = await prisma.subscriptionPayment.findFirst({
    where: { razorpayOrderId: orderId },
    include: { subscription: true },
  });

  if (!paymentRecord) {
    console.log('Payment record not found, may have been processed already');
    return;
  }

  // Skip if already completed
  if (paymentRecord.status === 'COMPLETED') {
    console.log('Payment already processed');
    return;
  }

  const subscription = paymentRecord.subscription;

  // Calculate dates
  const { startDate, endDate } = calculateSubscriptionDates(subscription.billingCycle);
  const planLimits = getPlanLimits(subscription.planType);
  const planFeatures = getPlanFeatures(subscription.planType);

  await prisma.$transaction(async (tx) => {
    // Update payment
    await tx.subscriptionPayment.update({
      where: { id: paymentRecord.id },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId: paymentId,
        paymentMethod: method,
        paidAt: new Date(),
      },
    });

    // Update subscription
    await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
      },
    });

    // Update business
    await tx.business.update({
      where: { id: subscription.businessId },
      data: {
        planType: subscription.planType,
        planStatus: 'ACTIVE',
        subscriptionEndsAt: endDate,
      },
    });

    // Update settings
    await tx.businessSettings.upsert({
      where: { businessId: subscription.businessId },
      update: {
        maxStores: planLimits.maxStores,
        maxStaff: planLimits.maxStaff,
        maxMonthlyOrders: planLimits.maxMonthlyOrders,
        workshopEnabled: planFeatures.workshopEnabled,
        multiStoreEnabled: planFeatures.multiStoreEnabled,
        smsNotifications: planFeatures.smsNotifications,
        whatsappIntegration: planFeatures.whatsappIntegration,
        advancedReports: planFeatures.advancedReports,
      },
      create: {
        businessId: subscription.businessId,
        maxStores: planLimits.maxStores,
        maxStaff: planLimits.maxStaff,
        maxMonthlyOrders: planLimits.maxMonthlyOrders,
        workshopEnabled: planFeatures.workshopEnabled,
        multiStoreEnabled: planFeatures.multiStoreEnabled,
        smsNotifications: planFeatures.smsNotifications,
        whatsappIntegration: planFeatures.whatsappIntegration,
        advancedReports: planFeatures.advancedReports,
      },
    });

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    await tx.invoice.create({
      data: {
        subscriptionId: subscription.id,
        invoiceNumber,
        amount: subscription.amount,
        tax: 0,
        totalAmount: subscription.amount,
        status: 'PAID',
        invoiceDate: new Date(),
        dueDate: new Date(),
        paidAt: new Date(),
      },
    });
  });

  console.log(`✅ Subscription activated for business: ${subscription.businessId}`);
}

async function handlePaymentFailed(payment: any) {
  const { id: paymentId, order_id: orderId, error_code, error_description } = payment;

  console.log(`❌ Payment failed: ${paymentId} - ${error_description}`);

  await prisma.subscriptionPayment.updateMany({
    where: { razorpayOrderId: orderId },
    data: {
      status: 'FAILED',
      razorpayPaymentId: paymentId,
      failureCode: error_code,
      failureMessage: error_description,
    },
  });
}

async function handleRefundCreated(refund: any) {
  const { payment_id: paymentId, amount } = refund;

  console.log(`💰 Refund created for payment: ${paymentId}`);

  await prisma.subscriptionPayment.updateMany({
    where: { razorpayPaymentId: paymentId },
    data: {
      status: 'REFUNDED',
    },
  });
}

async function handleOrderPaid(order: any, payment: any) {
  // This is an alternative to payment.captured
  // Can be used as a backup
  console.log(`📦 Order paid: ${order.id}`);
}