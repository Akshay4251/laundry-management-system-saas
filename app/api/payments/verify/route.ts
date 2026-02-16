// app/api/payments/verify/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { verifyPaymentSignature, getPaymentDetails, calculateSubscriptionDates } from '@/lib/razorpay';
import { getPlanLimits, getPlanFeatures } from '@/lib/plans';
import { z } from 'zod';

const verifySchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  subscriptionId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.error('Business not found');
    }

    const body = await req.json();
    const validation = verifySchema.safeParse(body);
    
    if (!validation.success) {
      return apiResponse.error('Invalid request data', 400);
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, subscriptionId } = validation.data;

    // Verify signature
    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      // Update payment as failed
      await prisma.subscriptionPayment.updateMany({
        where: { razorpayOrderId },
        data: {
          status: 'FAILED',
          failureMessage: 'Invalid payment signature',
        },
      });
      
      return apiResponse.error('Payment verification failed', 400);
    }

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpayPaymentId);

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return apiResponse.notFound('Subscription not found');
    }

    // Calculate subscription dates
    const { startDate, endDate } = calculateSubscriptionDates(subscription.billingCycle);

    // Get plan features and limits
    const planLimits = getPlanLimits(subscription.planType);
    const planFeatures = getPlanFeatures(subscription.planType);

    // Update everything in a transaction
    await prisma.$transaction(async (tx) => {
      // Update payment record
      await tx.subscriptionPayment.updateMany({
        where: { razorpayOrderId },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId,
          razorpaySignature,
          paymentMethod: paymentDetails.method || null,
          cardLast4: paymentDetails.card?.last4 || null,
          cardBrand: paymentDetails.card?.network || null,
          bank: paymentDetails.bank || null,
          wallet: paymentDetails.wallet || null,
          vpa: paymentDetails.vpa || null,
          paidAt: new Date(),
        },
      });

      // Update subscription
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        },
      });

      // Update business plan
      await tx.business.update({
        where: { id: businessId },
        data: {
          planType: subscription.planType,
          planStatus: 'ACTIVE',
          subscriptionEndsAt: endDate,
        },
      });

      // Update business settings with plan features
      await tx.businessSettings.upsert({
        where: { businessId },
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
          businessId,
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
          subscriptionId,
          invoiceNumber,
          amount: subscription.amount,
          tax: 0, // Add GST calculation if needed
          totalAmount: subscription.amount,
          status: 'PAID',
          invoiceDate: new Date(),
          dueDate: new Date(),
          paidAt: new Date(),
        },
      });
    });

    console.log(`✅ Payment verified for business ${businessId}, plan: ${subscription.planType}`);

    return apiResponse.success({
      success: true,
      message: 'Payment verified successfully',
      planType: subscription.planType,
      validUntil: endDate.toISOString(),
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return apiResponse.error('Failed to verify payment');
  }
}