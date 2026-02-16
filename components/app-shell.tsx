// components/app-shell.tsx
// ✅ NEW: Replaces SubscriptionGuard with unified shell
// Single loader for auth + subscription + core data

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/app/contexts/app-context';
import { AppLoader } from '@/components/ui/app-loader';

interface AppShellProps {
  children: React.ReactNode;
}

const ALLOWED_PATHS = [
  '/subscription-required',
  '/settings/billing',
  '/settings',
];

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status: sessionStatus } = useSession();
  const { subscription, isLoading } = useAppContext();

  useEffect(() => {
    // Wait for auth to complete
    if (sessionStatus === 'loading') return;

    // Redirect unauthenticated users
    if (sessionStatus === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    // Skip subscription check on allowed paths
    if (ALLOWED_PATHS.some(path => pathname?.startsWith(path))) {
      return;
    }

    // Check subscription once loaded
    if (!isLoading && subscription && !subscription.canAccess) {
      router.replace('/subscription-required');
    }
  }, [sessionStatus, subscription, isLoading, pathname, router]);

  // ⚡ OPTIMIZED: Single loader for everything
  if (sessionStatus === 'loading' || isLoading) {
    return <AppLoader message="Loading WashNDry" />;
  }

  // Redirect in progress
  if (sessionStatus === 'unauthenticated') {
    return <AppLoader message="Redirecting to login" />;
  }

  // Subscription expired, redirecting
  if (!isLoading && subscription && !subscription.canAccess && 
      !ALLOWED_PATHS.some(path => pathname?.startsWith(path))) {
    return <AppLoader message="Checking subscription" />;
  }

  // All checks passed - render app
  return <>{children}</>;
}