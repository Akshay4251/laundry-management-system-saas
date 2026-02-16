// app/api/payments/create-order/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { createRazorpayOrder } from '@/lib/razorpay';
import { BusinessPlan, BillingCycle } from '@prisma/client';
import { z } from 'zod';

const createOrderSchema = z.object({
  planType: z.enum(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  billingCycle: z.enum(['MONTHLY', 'SEMI_ANNUAL', 'ANNUAL']),
});

export async function POST(req: NextRequest) {
  try {
    // Check credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return apiResponse.error('Payment gateway not configured', 500);
    }

    // Authenticate
    const session = await auth();
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.error('Business not found', 400);
    }

    // Parse & validate
    const body = await req.json();
    const validation = createOrderSchema.safeParse(body);
    
    if (!validation.success) {
      return apiResponse.error('Invalid request data', 400);
    }

    const { planType, billingCycle } = validation.data;

    if (planType === 'ENTERPRISE') {
      return apiResponse.error('Please contact sales for Enterprise plan', 400);
    }

    // Get business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        user: {
          select: { email: true, fullName: true },
        },
      },
    });

    if (!business) {
      return apiResponse.notFound('Business not found');
    }

    // Create Razorpay order
    const orderData = await createRazorpayOrder({
      planType: planType as BusinessPlan,
      billingCycle: billingCycle as BillingCycle,
      businessId,
      businessName: business.businessName,
      customerEmail: business.user?.email || business.email || '',
    });

    // Create/Update subscription
    let subscription = await prisma.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          businessId,
          planType: planType as BusinessPlan,
          billingCycle: billingCycle as BillingCycle,
          amount: orderData.amount,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
        },
      });
    } else {
      subscription = await prisma.subscription.update({
        where: { businessId },
        data: {
          planType: planType as BusinessPlan,
          billingCycle: billingCycle as BillingCycle,
          amount: orderData.amount,
        },
      });
    }

    // Create payment record
    await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: orderData.amount,
        status: 'PENDING',
        razorpayOrderId: orderData.orderId,
        description: `${planType} Plan - ${billingCycle.replace('_', ' ').toLowerCase()}`,
      },
    });

    return apiResponse.success({
      ...orderData,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Payment order error:', error);
    return apiResponse.error('Failed to create payment order', 500);
  }
}