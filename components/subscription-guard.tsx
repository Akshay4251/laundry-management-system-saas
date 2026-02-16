// components/subscription-guard.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSubscriptionStatus } from '@/app/hooks/use-subscription-status';
import { Loader2 } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const ALLOWED_PATHS = [
  '/subscription-required',
  '/settings/billing',
  '/settings',
];

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { canAccess, isLoading, isExpired, status } = useSubscriptionStatus();

  useEffect(() => {
    // Skip if on allowed path
    if (ALLOWED_PATHS.some(path => pathname?.startsWith(path))) {
      return;
    }

    // Redirect if can't access (trial expired or subscription expired)
    if (!isLoading && !canAccess) {
      console.log('Subscription Guard: Redirecting to subscription-required', {
        canAccess,
        isExpired,
        reason: status?.reason,
      });
      router.replace('/subscription-required');
    }
  }, [canAccess, isLoading, isExpired, pathname, router, status]);

  // Show loading spinner while checking subscription
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          <p className="text-sm text-slate-500">Checking subscription...</p>
        </div>
      </div>
    );
  }

  // If on subscription-required page, always show it
  if (pathname === '/subscription-required') {
    return <>{children}</>;
  }

  // If can't access and not on allowed path, show loading while redirecting
  if (!canAccess && !ALLOWED_PATHS.some(path => pathname?.startsWith(path))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          <p className="text-sm text-slate-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}