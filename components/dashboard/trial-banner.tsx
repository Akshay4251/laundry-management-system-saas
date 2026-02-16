// components/dashboard/trial-banner.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Gift, Clock, Zap } from 'lucide-react';
import { useBusinessFeatures } from '@/app/hooks/use-business-features';
import { useSubscription } from '@/app/hooks/use-subscription';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function TrialBanner() {
  const [mounted, setMounted] = useState(false);
  
  const { isTrial, isLoading: featuresLoading } = useBusinessFeatures();
  const { data: subscriptionData, isLoading: subLoading } = useSubscription();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || featuresLoading || subLoading || !isTrial) {
    return null;
  }

  const daysRemaining = subscriptionData?.daysRemaining ?? 14;
  const isUrgent = daysRemaining <= 3;
  const isWarning = daysRemaining <= 7 && !isUrgent;
  const progressPercent = ((14 - daysRemaining) / 14) * 100;

  const getConfig = () => {
    if (isUrgent) {
      return {
        bg: 'bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400',
        iconBg: 'bg-white/90',
        iconColor: 'text-rose-500',
        icon: Clock,
        badge: 'bg-white/20 text-white border-white/30',
        buttonBg: 'bg-white hover:bg-rose-50',
        buttonText: 'text-rose-600',
        buttonShadow: 'shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40',
      };
    }
    if (isWarning) {
      return {
        bg: 'bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400',
        iconBg: 'bg-white/90',
        iconColor: 'text-amber-500',
        icon: Zap,
        badge: 'bg-white/20 text-white border-white/30',
        buttonBg: 'bg-white hover:bg-amber-50',
        buttonText: 'text-amber-600',
        buttonShadow: 'shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40',
      };
    }
    return {
      bg: 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500',
      iconBg: 'bg-white/90',
      iconColor: 'text-violet-500',
      icon: Gift,
      badge: 'bg-white/20 text-white border-white/30',
      buttonBg: 'bg-white hover:bg-violet-50',
      buttonText: 'text-violet-600',
      buttonShadow: 'shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40',
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full overflow-hidden"
    >
      <div className={cn('relative', config.bg)}>
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full blur-xl" />
        </div>

        {/* Content */}
        <div className="relative px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left side */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Icon */}
              <div className={cn(
                'hidden sm:flex w-8 h-8 rounded-xl items-center justify-center shrink-0',
                config.iconBg
              )}>
                <Icon className={cn('w-4 h-4', config.iconColor)} />
              </div>
              
              {/* Text content */}
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {/* Badge */}
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                  config.badge
                )}>
                  {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  {isUrgent ? 'ENDING SOON' : isWarning ? `${daysRemaining} DAYS LEFT` : 'FREE TRIAL'}
                </span>
                
                {/* Message */}
                <p className="text-sm font-medium text-white">
                  {isUrgent ? (
                    <>
                      Only <span className="font-bold">{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span> left
                      <span className="hidden sm:inline"> — Don't lose your data!</span>
                    </>
                  ) : isWarning ? (
                    <>
                      <span className="hidden sm:inline">Your trial ends soon — </span>
                      <span className="font-bold">Upgrade now</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold">{daysRemaining} days</span> of Pro features
                      <span className="hidden md:inline"> remaining</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Right side - CTA */}
            <Link href="/settings?tab=billing" className="shrink-0">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-bold transition-all duration-200',
                  config.buttonBg,
                  config.buttonText,
                  config.buttonShadow
                )}
              >
                {isUrgent ? 'Upgrade Now' : 'See Plans'}
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-black/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full bg-white/50 rounded-r-full"
          />
        </div>
      </div>
    </motion.div>
  );
}