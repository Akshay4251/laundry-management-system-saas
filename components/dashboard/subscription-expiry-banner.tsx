// components/dashboard/subscription-expiry-banner.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useSubscriptionStatus } from '@/app/hooks/use-subscription-status';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SubscriptionExpiryBanner() {
  const [mounted, setMounted] = useState(false);
  const { status, isLoading } = useSubscriptionStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return null;
  }

  // Only show for active paid subscriptions expiring within 3 days
  if (!status) return null;
  if (status.reason === 'trial' || status.reason === 'trial_expired') return null;
  if (status.reason !== 'active') return null;
  if (status.daysRemaining > 3) return null;

  const daysRemaining = status.daysRemaining;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full overflow-hidden"
    >
      <div className="bg-red-50 border-b border-red-200">
        <div className="px-4 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* Left */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-700">
                {daysRemaining === 0 
                  ? 'Your subscription expires today — Renew now'
                  : `Subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} — Renew now`
                }
              </p>
            </div>

            {/* Right */}
            <Link href="/subscription-required" className="shrink-0">
              <button className="flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors">
                Renew
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}