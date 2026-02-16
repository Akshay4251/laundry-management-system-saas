// app/(auth)/subscription-required/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Shield, 
  Zap,
  Check,
  Building2,
  LogOut,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { useSubscriptionStatus } from '@/app/hooks/use-subscription-status';
import { useRazorpayCheckout } from '@/app/hooks/use-subscription';
import { PLANS, getPlanPrice, getSavingsPercentage, getMonthlyEquivalent } from '@/lib/plans';
import { BusinessPlan, BillingCycle } from '@prisma/client';
import { toast } from 'sonner';

const billingOptions: { value: BillingCycle; label: string; short: string }[] = [
  { value: 'MONTHLY', label: 'Monthly', short: 'mo' },
  { value: 'SEMI_ANNUAL', label: '6 Months', short: '6mo' },
  { value: 'ANNUAL', label: 'Annual', short: 'yr' },
];

export default function SubscriptionRequiredPage() {
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan>('PROFESSIONAL');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('ANNUAL');
  const [mounted, setMounted] = useState(false);
  
  const { status, refetch, isLoading: statusLoading } = useSubscriptionStatus();
  const { initiateCheckout, isLoading: checkoutLoading } = useRazorpayCheckout();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpgrade = async (plan: BusinessPlan) => {
    try {
      await initiateCheckout(plan, billingCycle);
      toast.success('Payment successful!');
      await refetch();
      window.location.href = '/dashboard';
    } catch (error: any) {
      if (error.message !== 'Payment cancelled') {
        toast.error(error.message || 'Payment failed');
      }
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (!mounted) return null;

  const getStatusConfig = () => {
    switch (status?.reason) {
      case 'trial_expired':
        return {
          icon: Clock,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          title: 'Your Free Trial Has Ended',
          subtitle: 'Choose a plan to continue using WashNDry',
        };
      case 'subscription_expired':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          title: 'Your Subscription Has Expired',
          subtitle: 'Renew your subscription to regain access',
        };
      case 'cancelled':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          title: 'Subscription Cancelled',
          subtitle: 'Reactivate to continue using WashNDry',
        };
      default:
        return {
          icon: Sparkles,
          iconBg: 'bg-violet-100',
          iconColor: 'text-violet-600',
          title: 'Choose Your Plan',
          subtitle: 'Select a plan to get started',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const plans = [
    {
      id: 'BASIC' as BusinessPlan,
      name: 'Basic',
      tagline: 'For small shops',
      icon: Zap,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      selectedBg: 'bg-emerald-50',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
      features: [
        '500 orders/month',
        '5 staff accounts',
        'Email notifications',
        'Standard support',
      ],
    },
    {
      id: 'PROFESSIONAL' as BusinessPlan,
      name: 'Professional',
      tagline: 'For growing businesses',
      icon: Crown,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      borderColor: 'border-violet-200',
      selectedBg: 'bg-violet-50',
      buttonColor: 'bg-violet-600 hover:bg-violet-700',
      popular: true,
      features: [
        '2,000 orders/month',
        '20 staff accounts',
        'Multi-store support',
        'Workshop management',
        'SMS & WhatsApp',
        'Priority support',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">WashNDry</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={statusLoading}
              className="text-slate-500"
            >
              <RefreshCw className={cn('w-4 h-4', statusLoading && 'animate-spin')} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Status Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className={cn(
              'inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4',
              statusConfig.iconBg
            )}>
              <StatusIcon className={cn('w-8 h-8', statusConfig.iconColor)} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {statusConfig.title}
            </h1>
            <p className="text-slate-500">
              {statusConfig.subtitle}
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center p-1 bg-white rounded-full border border-slate-200 shadow-sm">
              {billingOptions.map((option) => {
                const savings = getSavingsPercentage('PROFESSIONAL', option.value);
                const isSelected = billingCycle === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setBillingCycle(option.value)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {option.label}
                    {savings > 0 && (
                      <span className={cn(
                        'ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'
                      )}>
                        -{savings}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {plans.map((plan) => {
              const price = getPlanPrice(plan.id, billingCycle);
              const monthlyPrice = getMonthlyEquivalent(plan.id, billingCycle);
              const isSelected = selectedPlan === plan.id;
              const billing = billingOptions.find(b => b.value === billingCycle);

              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    'relative bg-white rounded-2xl p-6 cursor-pointer transition-all border-2',
                    isSelected
                      ? `${plan.borderColor} ${plan.selectedBg} shadow-lg`
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 text-white text-xs font-bold rounded-full">
                      RECOMMENDED
                    </span>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', plan.iconBg)}>
                        <plan.icon className={cn('w-5 h-5', plan.iconColor)} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{plan.name}</h3>
                        <p className="text-xs text-slate-500">{plan.tagline}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', plan.iconBg)}>
                        <Check className={cn('w-4 h-4', plan.iconColor)} />
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-slate-900">{formatPrice(price)}</span>
                    <span className="text-slate-400 text-sm">/{billing?.short}</span>
                    {billingCycle !== 'MONTHLY' && (
                      <p className="text-xs text-slate-500 mt-1">
                        {formatPrice(monthlyPrice)}/mo billed {billingCycle === 'ANNUAL' ? 'yearly' : 'semi-annually'}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className={cn('w-4 h-4', plan.iconColor)} />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgrade(plan.id);
                    }}
                    disabled={checkoutLoading}
                    className={cn('w-full rounded-xl', plan.buttonColor)}
                  >
                    {checkoutLoading && selectedPlan === plan.id ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Get {plan.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Enterprise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Enterprise</h3>
                  <p className="text-xs text-slate-500">Custom pricing for large operations</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => window.open('mailto:sales@WashNDry.com', '_blank')}
              >
                Contact Sales
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Trust */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secure Payment
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Cancel Anytime
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}