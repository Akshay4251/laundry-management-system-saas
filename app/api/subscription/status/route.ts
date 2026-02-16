// app/api/subscription/status/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export interface SubscriptionStatus {
  isActive: boolean;
  reason: 'active' | 'trial' | 'trial_expired' | 'subscription_expired' | 'cancelled' | 'blocked';
  daysRemaining: number;
  canAccess: boolean;
  planType: string;
  planStatus: string;
  expiresAt: string | null;
  showBanner: boolean;
  bannerType: 'trial' | 'expiring' | 'none';
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    // Super admin always has access
    if (session.user.isSuperAdmin) {
      return apiResponse.success<SubscriptionStatus>({
        isActive: true,
        reason: 'active',
        daysRemaining: 999,
        canAccess: true,
        planType: 'SUPER_ADMIN',
        planStatus: 'ACTIVE',
        expiresAt: null,
        showBanner: false,
        bannerType: 'none',
      });
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.error('Business not found', 400);
    }

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

    const now = new Date();

    // ========================================
    // TRIAL USERS
    // ========================================
    if (business.planType === 'TRIAL' || business.planStatus === 'TRIAL') {
      let trialEndsAt = business.trialEndsAt;
      
      // Set trial end date if not set
      if (!trialEndsAt) {
        trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);
        
        await prisma.business.update({
          where: { id: businessId },
          data: { trialEndsAt },
        });
      }

      const diffMs = trialEndsAt.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Trial expired
      if (now > trialEndsAt) {
        return apiResponse.success<SubscriptionStatus>({
          isActive: false,
          reason: 'trial_expired',
          daysRemaining: 0,
          canAccess: false,
          planType: business.planType,
          planStatus: 'EXPIRED',
          expiresAt: trialEndsAt.toISOString(),
          showBanner: false,
          bannerType: 'none',
        });
      }

      // Trial active
      return apiResponse.success<SubscriptionStatus>({
        isActive: true,
        reason: 'trial',
        daysRemaining: Math.max(0, daysRemaining),
        canAccess: true,
        planType: business.planType,
        planStatus: business.planStatus,
        expiresAt: trialEndsAt.toISOString(),
        showBanner: true,
        bannerType: 'trial',
      });
    }

    // ========================================
    // CANCELLED USERS
    // ========================================
    if (business.planStatus === 'CANCELLED') {
      return apiResponse.success<SubscriptionStatus>({
        isActive: false,
        reason: 'cancelled',
        daysRemaining: 0,
        canAccess: false,
        planType: business.planType,
        planStatus: business.planStatus,
        expiresAt: business.subscriptionEndsAt?.toISOString() || null,
        showBanner: false,
        bannerType: 'none',
      });
    }

    // ========================================
    // PAID SUBSCRIPTION USERS
    // ========================================
    const subscriptionEndsAt = business.subscriptionEndsAt;
    
    // No subscription end date (shouldn't happen for paid users, but handle it)
    if (!subscriptionEndsAt) {
      return apiResponse.success<SubscriptionStatus>({
        isActive: true,
        reason: 'active',
        daysRemaining: 999,
        canAccess: true,
        planType: business.planType,
        planStatus: business.planStatus,
        expiresAt: null,
        showBanner: false,
        bannerType: 'none',
      });
    }

    const diffMs = subscriptionEndsAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Subscription expired - NO grace period
    if (now > subscriptionEndsAt) {
      // Update plan status to EXPIRED
      await prisma.business.update({
        where: { id: businessId },
        data: { planStatus: 'SUSPENDED' },
      });

      return apiResponse.success<SubscriptionStatus>({
        isActive: false,
        reason: 'subscription_expired',
        daysRemaining: 0,
        canAccess: false,
        planType: business.planType,
        planStatus: 'EXPIRED',
        expiresAt: subscriptionEndsAt.toISOString(),
        showBanner: false,
        bannerType: 'none',
      });
    }

    // Subscription expiring within 3 days - Show warning banner
    if (daysRemaining <= 3) {
      return apiResponse.success<SubscriptionStatus>({
        isActive: true,
        reason: 'active',
        daysRemaining,
        canAccess: true,
        planType: business.planType,
        planStatus: business.planStatus,
        expiresAt: subscriptionEndsAt.toISOString(),
        showBanner: true,
        bannerType: 'expiring',
      });
    }

    // Active subscription with more than 3 days
    return apiResponse.success<SubscriptionStatus>({
      isActive: true,
      reason: 'active',
      daysRemaining,
      canAccess: true,
      planType: business.planType,
      planStatus: business.planStatus,
      expiresAt: subscriptionEndsAt.toISOString(),
      showBanner: false,
      bannerType: 'none',
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return apiResponse.error('Failed to check subscription status');
  }
}