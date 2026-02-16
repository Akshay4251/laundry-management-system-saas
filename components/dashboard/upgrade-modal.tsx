// components/dashboard/upgrade-modal.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Check,
  Zap,
  Crown,
  Loader2,
  ArrowRight,
  Sparkles,
  Shield,
  Building2,
  Users,
  BarChart3,
  MessageSquare,
  Store,
  Wrench,
  Mail,
  Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRazorpayCheckout } from '@/app/hooks/use-subscription';
import { PLANS, getPlanPrice, getSavingsPercentage, getMonthlyEquivalent } from '@/lib/plans';
import { BusinessPlan, BillingCycle } from '@prisma/client';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: BusinessPlan;
  featureNeeded?: string;
}

const billingOptions: { value: BillingCycle; label: string; short: string }[] = [
  { value: 'MONTHLY', label: 'Monthly', short: 'mo' },
  { value: 'SEMI_ANNUAL', label: '6 Months', short: '6mo' },
  { value: 'ANNUAL', label: 'Annual', short: 'yr' },
];

export function UpgradeModal({
  open,
  onOpenChange,
  currentPlan = 'TRIAL',
  featureNeeded,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan>('PROFESSIONAL');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('ANNUAL');
  const { initiateCheckout, isLoading } = useRazorpayCheckout();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpgrade = async () => {
    try {
      await initiateCheckout(selectedPlan, billingCycle);
      onOpenChange(false);
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const plans = [
    {
      id: 'BASIC' as BusinessPlan,
      name: 'Basic',
      tagline: 'For small shops',
      icon: Zap,
      color: 'emerald',
      gradient: 'from-emerald-400 to-teal-500',
      lightBg: 'bg-emerald-50',
      features: [
        { icon: BarChart3, text: '500 orders/month' },
        { icon: Users, text: '5 staff accounts' },
        { icon: Mail, text: 'Email notifications' },
        { icon: Headphones, text: 'Standard support' },
      ],
    },
    {
      id: 'PROFESSIONAL' as BusinessPlan,
      name: 'Professional',
      tagline: 'For growing businesses',
      icon: Crown,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-600',
      lightBg: 'bg-violet-50',
      popular: true,
      features: [
        { icon: BarChart3, text: '2,000 orders/month' },
        { icon: Users, text: '20 staff accounts' },
        { icon: Store, text: 'Multi-store support' },
        { icon: Wrench, text: 'Workshop management' },
        { icon: MessageSquare, text: 'SMS & WhatsApp' },
        { icon: Headphones, text: 'Priority support' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-3xl">
        {/* Header with gradient */}
        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500" />
          
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>
          
          {/* Content */}
          <div className="relative px-8 py-8">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    Choose Your Plan
                  </DialogTitle>
                  <p className="text-white/80 text-sm mt-1">
                    {featureNeeded 
                      ? `Unlock ${featureNeeded} and supercharge your business`
                      : 'Select the perfect plan for your laundry business'
                    }
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Billing Toggle */}
            <div className="flex justify-center mt-6">
              <div className="inline-flex items-center p-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                {billingOptions.map((option) => {
                  const savings = getSavingsPercentage('PROFESSIONAL', option.value);
                  const isSelected = billingCycle === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setBillingCycle(option.value)}
                      className={cn(
                        'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                        isSelected
                          ? 'bg-white text-violet-600 shadow-lg'
                          : 'text-white/80 hover:text-white'
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {option.label}
                        {savings > 0 && (
                          <span className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                            isSelected
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-white/20 text-white'
                          )}>
                            Save {savings}%
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="px-6 py-6 -mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const price = getPlanPrice(plan.id, billingCycle);
              const monthlyPrice = getMonthlyEquivalent(plan.id, billingCycle);
              const isSelected = selectedPlan === plan.id;
              const isCurrent = currentPlan === plan.id;
              const selectedBilling = billingOptions.find(b => b.value === billingCycle);

              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => !isCurrent && setSelectedPlan(plan.id)}
                  className={cn(
                    'relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300',
                    isCurrent
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? plan.color === 'emerald'
                        ? 'border-emerald-400 bg-emerald-50/50 shadow-lg shadow-emerald-500/10'
                        : 'border-violet-400 bg-violet-50/50 shadow-lg shadow-violet-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  )}
                >
                  {/* Popular badge */}
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg',
                        `bg-gradient-to-r ${plan.gradient}`
                      )}>
                        <Sparkles className="w-3 h-3" />
                        RECOMMENDED
                      </span>
                    </div>
                  )}

                  {/* Current plan badge */}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                        CURRENT PLAN
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center',
                      `bg-gradient-to-br ${plan.gradient}`
                    )}>
                      <plan.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                      <p className="text-slate-500 text-xs">{plan.tagline}</p>
                    </div>
                    
                    {/* Selection indicator */}
                    <AnimatePresence>
                      {isSelected && !isCurrent && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center',
                            `bg-gradient-to-br ${plan.gradient}`
                          )}
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        {formatPrice(price)}
                      </span>
                      <span className="text-slate-400 text-sm font-medium">
                        /{selectedBilling?.short}
                      </span>
                    </div>
                    {billingCycle !== 'MONTHLY' && (
                      <p className="text-xs text-slate-500 mt-1">
                        {formatPrice(monthlyPrice)}/month when billed {billingCycle === 'ANNUAL' ? 'yearly' : 'semi-annually'}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <div className={cn(
                          'w-5 h-5 rounded-md flex items-center justify-center',
                          plan.lightBg
                        )}>
                          <feature.icon className={cn(
                            'w-3 h-3',
                            plan.color === 'emerald' ? 'text-emerald-600' : 'text-violet-600'
                          )} />
                        </div>
                        <span className="text-sm text-slate-600">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Enterprise option */}
          <div 
            onClick={() => window.open('mailto:sales@laundrypro.com', '_blank')}
            className="mt-4 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    Enterprise
                    <span className="text-xs font-medium text-slate-400">Custom Pricing</span>
                  </h3>
                  <p className="text-xs text-slate-500">Unlimited orders, custom integrations, dedicated account manager</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 group-hover:text-slate-900">
                Contact Sales
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between">
            {/* Security */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-700">Secure Payment</p>
                <p className="text-[10px] text-slate-500">Powered by Razorpay</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpgrade}
                disabled={isLoading || selectedPlan === currentPlan}
                className={cn(
                  'rounded-full px-6 font-semibold',
                  'bg-gradient-to-r from-violet-600 to-purple-600',
                  'hover:from-violet-700 hover:to-purple-700',
                  'shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40',
                  'transition-all duration-300',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Upgrade to {plans.find(p => p.id === selectedPlan)?.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}