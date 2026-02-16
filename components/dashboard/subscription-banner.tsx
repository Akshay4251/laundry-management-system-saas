// components/dashboard/subscription-banner.tsx
// ✅ OPTIMIZED: Use AppContext instead of separate hook

'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/app/contexts/app-context'; // ⚡ NEW
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SubscriptionBanner() {
  const [mounted, setMounted] = useState(false);
  
  // ⚡ OPTIMIZED: Use unified context
  const { subscription, isLoading } = useAppContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server, while loading, or if no banner needed
  if (!mounted || isLoading || !subscription?.showBanner) {
    return null;
  }

  // Trial Banner
  if (subscription.bannerType === 'trial') {
    return <TrialBannerContent daysRemaining={subscription.daysRemaining} />;
  }

  // Subscription Expiring Banner
  if (subscription.bannerType === 'expiring') {
    return <ExpiringBannerContent daysRemaining={subscription.daysRemaining} />;
  }

  return null;
}

function TrialBannerContent({ daysRemaining }: { daysRemaining: number }) {
  const getConfig = () => {
    if (daysRemaining <= 3) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-500',
        button: 'bg-red-600 hover:bg-red-700 text-white',
        message: daysRemaining === 0 
          ? 'Trial ends today — Upgrade now'
          : daysRemaining === 1
          ? 'Trial ends tomorrow — Upgrade now'
          : `Trial ends in ${daysRemaining} days — Upgrade now`,
      };
    }
    if (daysRemaining <= 7) {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: 'text-amber-500',
        button: 'bg-amber-600 hover:bg-amber-700 text-white',
        message: `${daysRemaining} days left in your trial`,
      };
    }
    return {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: 'text-emerald-500',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      message: `${daysRemaining} days remaining in your free trial`,
    };
  };

  const config = getConfig();

  return (
    <div className={cn('border-b', config.bg, config.border)}>
      <div className="px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Clock className={cn('w-4 h-4 shrink-0', config.icon)} />
            <p className={cn('text-sm font-medium', config.text)}>
              {config.message}
            </p>
          </div>

          <Link href="/subscription-required" className="shrink-0">
            <button
              className={cn(
                'flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold transition-colors',
                config.button
              )}
            >
              Upgrade
              <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ExpiringBannerContent({ daysRemaining }: { daysRemaining: number }) {
  const getMessage = () => {
    if (daysRemaining === 0) return 'Your subscription expires today — Renew now';
    if (daysRemaining === 1) return 'Your subscription expires tomorrow — Renew now';
    return `Your subscription expires in ${daysRemaining} days — Renew now`;
  };

  return (
    <div className="bg-red-50 border-b border-red-200">
      <div className="px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-700">
              {getMessage()}
            </p>
          </div>

          <Link href="/subscription-required" className="shrink-0">
            <button className="flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors">
              Renew
              <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}