// app/hooks/use-subscription-status.ts

import { useAppContext } from '@/app/contexts/app-context';

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

export function useSubscriptionStatus() {
  const { subscription, isLoading } = useAppContext();

  return {
    status: subscription,
    isLoading,
    isError: false,
    error: null,
    refetch: async () => {},
    canAccess: subscription?.canAccess ?? true,
    isExpired: subscription?.reason === 'trial_expired' || subscription?.reason === 'subscription_expired',
    isTrial: subscription?.reason === 'trial',
    isTrialExpired: subscription?.reason === 'trial_expired',
    isSubscriptionExpired: subscription?.reason === 'subscription_expired',
    daysRemaining: subscription?.daysRemaining ?? 0,
    showBanner: subscription?.showBanner ?? false,
    bannerType: subscription?.bannerType ?? 'none',
  };
}