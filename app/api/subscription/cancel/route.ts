// app/api/subscription/cancel/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';

const cancelSchema = z.object({
  reason: z.string().optional(),
  immediate: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    // Only owners can cancel subscriptions
    if (session.user.role !== 'OWNER') {
      return apiResponse.error('Only business owners can cancel subscriptions', 403);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.error('Business not found');
    }

    const body = await req.json();
    const validation = cancelSchema.safeParse(body);
    
    if (!validation.success) {
      return apiResponse.error('Invalid request data', 400);
    }

    const { reason, immediate } = validation.data;

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      return apiResponse.notFound('No active subscription found');
    }

    if (subscription.status === 'CANCELLED') {
      return apiResponse.error('Subscription is already cancelled', 400);
    }

    // Cancel subscription
    await prisma.$transaction(async (tx) => {
      // Update subscription
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason || 'User requested cancellation',
        },
      });

      // If immediate cancellation, downgrade to trial/basic immediately
      if (immediate) {
        await tx.business.update({
          where: { id: businessId },
          data: {
            planType: 'TRIAL',
            planStatus: 'CANCELLED',
            subscriptionEndsAt: new Date(),
          },
        });

        // Reset settings to trial limits
        await tx.businessSettings.update({
          where: { businessId },
          data: {
            maxStores: 1,
            maxStaff: 3,
            maxMonthlyOrders: 50,
            workshopEnabled: false,
            multiStoreEnabled: false,
            smsNotifications: false,
            whatsappIntegration: false,
            advancedReports: false,
          },
        });
      } else {
        // Subscription will remain active until period end
        await tx.business.update({
          where: { id: businessId },
          data: {
            planStatus: 'CANCELLED', // Mark as cancelled but still active
          },
        });
      }
    });

    console.log(`✅ Subscription cancelled for business ${businessId}`);

    return apiResponse.success({
      message: immediate 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will be cancelled at the end of the billing period',
      effectiveDate: immediate ? new Date() : subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return apiResponse.error('Failed to cancel subscription');
  }
}