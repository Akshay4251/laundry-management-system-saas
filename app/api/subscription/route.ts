// app/api/subscription/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { getDaysRemaining } from '@/lib/plans';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.error('Business not found', 400);
    }

    // Get business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        planType: true,
        planStatus: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
      },
    });

    if (!business) {
      return apiResponse.notFound('Business not found');
    }

    // Get subscription if exists
    const subscription = await prisma.subscription.findUnique({
      where: { businessId },
    });

    const isTrial = business.planType === 'TRIAL' || business.planStatus === 'TRIAL';

    // Handle trial
    if (isTrial) {
      // ✅ FIX: If trialEndsAt is null, calculate it (14 days from now)
      let trialEndsAt = business.trialEndsAt;
      
      if (!trialEndsAt) {
        // Auto-set trial end date if missing
        trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);
        
        // Update database
        await prisma.business.update({
          where: { id: businessId },
          data: { trialEndsAt },
        });
      }

      const daysRemaining = getDaysRemaining(trialEndsAt);

      return apiResponse.success({
        hasSubscription: false,
        planType: business.planType,
        planStatus: business.planStatus,
        trialEndsAt: trialEndsAt.toISOString(),
        daysRemaining,
      });
    }

    // Handle active subscription
    if (subscription) {
      const daysRemaining = business.subscriptionEndsAt 
        ? getDaysRemaining(business.subscriptionEndsAt)
        : 0;

      return apiResponse.success({
        hasSubscription: true,
        planType: business.planType,
        planStatus: business.planStatus,
        subscription: {
          id: subscription.id,
          planType: subscription.planType,
          billingCycle: subscription.billingCycle,
          amount: parseFloat(subscription.amount.toString()),
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart.toISOString(),
          currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        },
        subscriptionEndsAt: business.subscriptionEndsAt?.toISOString() || null,
        daysRemaining,
      });
    }

    // No subscription (free tier)
    return apiResponse.success({
      hasSubscription: false,
      planType: business.planType,
      planStatus: business.planStatus,
      daysRemaining: 0,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return apiResponse.error('Failed to fetch subscription');
  }
}