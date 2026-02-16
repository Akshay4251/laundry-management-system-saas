// app/(dashboard)/settings/billing/page.tsx

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Loader2,
  Crown,
  Zap,
  Building2,
  XCircle,
  Sparkles,
  Shield,
  Check,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscription, useBillingHistory, useCancelSubscription, useRazorpayCheckout } from '@/app/hooks/use-subscription';
import { useBusinessFeatures } from '@/app/hooks/use-business-features';
import { PLANS, getPlanPrice, getSavingsPercentage, getMonthlyEquivalent } from '@/lib/plans';
import { BusinessPlan, BillingCycle } from '@prisma/client';

// ============================================================================
// CONSTANTS
// ============================================================================

const planConfig = {
  TRIAL: { icon: Sparkles, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
  BASIC: { icon: Zap, color: 'slate', gradient: 'from-slate-600 to-slate-700' },
  PROFESSIONAL: { icon: Crown, color: 'blue', gradient: 'from-blue-600 to-cyan-600' },
  ENTERPRISE: { icon: Building2, color: 'purple', gradient: 'from-purple-600 to-indigo-600' },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'emerald', label: 'Active' },
  TRIAL: { color: 'amber', label: 'Trial' },
  PAST_DUE: { color: 'red', label: 'Past Due' },
  CANCELLED: { color: 'slate', label: 'Cancelled' },
  EXPIRED: { color: 'red', label: 'Expired' },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BillingPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan>('PROFESSIONAL');
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('ANNUAL');

  const { data: subscriptionData, isLoading: subLoading, refetch } = useSubscription();
  const { data: billingData, isLoading: billingLoading } = useBillingHistory();
  const { planType, planStatus, isTrial } = useBusinessFeatures();
  const cancelSubscription = useCancelSubscription();
  const { initiateCheckout, isLoading: checkoutLoading } = useRazorpayCheckout();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan || selectedPlan === 'TRIAL' || selectedPlan === 'ENTERPRISE') return;
    
    try {
      await initiateCheckout(selectedPlan, selectedCycle);
      setShowUpgradeModal(false);
      refetch();
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription.mutateAsync(cancelReason);
      setShowCancelDialog(false);
      setCancelReason('');
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  if (subLoading) {
    return <BillingPageSkeleton />;
  }

  const config = planConfig[planType as keyof typeof planConfig] || planConfig.BASIC;
  const PlanIcon = config.icon;
  const status = statusConfig[planStatus] || statusConfig.ACTIVE;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
        <p className="text-slate-500 mt-1">Manage your plan, billing cycle, and payment history</p>
      </div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
      >
        {/* Gradient Header */}
        <div className={cn('h-2 bg-gradient-to-r', config.gradient)} />
        
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Plan Info */}
            <div className="flex items-start gap-4">
              <div className={cn(
                'p-3 rounded-2xl',
                config.color === 'amber' && 'bg-amber-100',
                config.color === 'slate' && 'bg-slate-100',
                config.color === 'blue' && 'bg-blue-100',
                config.color === 'purple' && 'bg-purple-100',
              )}>
                <PlanIcon className={cn(
                  'w-6 h-6',
                  config.color === 'amber' && 'text-amber-600',
                  config.color === 'slate' && 'text-slate-600',
                  config.color === 'blue' && 'text-blue-600',
                  config.color === 'purple' && 'text-purple-600',
                )} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    {PLANS[planType as BusinessPlan]?.name || planType} Plan
                  </h2>
                  <Badge className={cn(
                    'rounded-full font-medium',
                    status.color === 'emerald' && 'bg-emerald-100 text-emerald-700',
                    status.color === 'amber' && 'bg-amber-100 text-amber-700',
                    status.color === 'red' && 'bg-red-100 text-red-700',
                    status.color === 'slate' && 'bg-slate-100 text-slate-700',
                  )}>
                    {status.label}
                  </Badge>
                </div>
                <p className="text-slate-500 mt-1">
                  {PLANS[planType as BusinessPlan]?.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className={cn(
                  'rounded-full font-semibold shadow-lg shadow-blue-500/25',
                  'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                )}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                {isTrial ? 'Upgrade Now' : 'Change Plan'}
              </Button>
              {subscriptionData?.hasSubscription && planStatus === 'ACTIVE' && (
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                  className="rounded-full text-slate-600 border-slate-200"
                >
                  Cancel Plan
                </Button>
              )}
            </div>
          </div>

          {/* Plan Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {/* Billing Cycle */}
            {subscriptionData?.hasSubscription && subscriptionData.subscription && (
              <>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <CreditCard className="w-4 h-4" />
                    Billing Cycle
                  </div>
                  <p className="font-semibold text-slate-900">
                    {subscriptionData.subscription.billingCycle.replace('_', ' ')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    Next Billing
                  </div>
                  <p className="font-semibold text-slate-900">
                    {format(new Date(subscriptionData.subscription.currentPeriodEnd), 'MMM d, yyyy')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Shield className="w-4 h-4" />
                    Amount
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatPrice(subscriptionData.subscription.amount)}
                  </p>
                </div>
              </>
            )}

            {/* Trial Info */}
            {isTrial && subscriptionData?.trialEndsAt && (
              <>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Trial Ends
                  </div>
                  <p className="font-semibold text-amber-700">
                    {format(new Date(subscriptionData.trialEndsAt), 'MMM d, yyyy')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
                    <Sparkles className="w-4 h-4" />
                    Days Left
                  </div>
                  <p className="font-semibold text-amber-700">
                    {subscriptionData.daysRemaining} days
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Trial Upgrade Prompt */}
      {isTrial && subscriptionData?.daysRemaining !== undefined && subscriptionData.daysRemaining <= 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'p-6 rounded-3xl border-2',
            subscriptionData.daysRemaining <= 3
              ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
              : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
          )}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                'p-2 rounded-xl',
                subscriptionData.daysRemaining <= 3 ? 'bg-red-100' : 'bg-amber-100'
              )}>
                <AlertTriangle className={cn(
                  'w-5 h-5',
                  subscriptionData.daysRemaining <= 3 ? 'text-red-600' : 'text-amber-600'
                )} />
              </div>
              <div>
                <h3 className={cn(
                  'font-semibold',
                  subscriptionData.daysRemaining <= 3 ? 'text-red-900' : 'text-amber-900'
                )}>
                  {subscriptionData.daysRemaining <= 3 ? 'Trial Ending Very Soon!' : 'Trial Ending Soon'}
                </h3>
                <p className={cn(
                  'text-sm mt-0.5',
                  subscriptionData.daysRemaining <= 3 ? 'text-red-700' : 'text-amber-700'
                )}>
                  {subscriptionData.daysRemaining} days remaining. Upgrade now to keep all your data and features.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className={cn(
                'rounded-full font-semibold shrink-0',
                subscriptionData.daysRemaining <= 3
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              )}
            >
              Upgrade Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
      >
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Billing History</h3>
          <p className="text-sm text-slate-500">View your past invoices and payments</p>
        </div>

        <div className="divide-y divide-slate-100">
          {billingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : billingData?.items && billingData.items.length > 0 ? (
            billingData.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'p-2 rounded-xl',
                    item.status === 'COMPLETED' && 'bg-emerald-100',
                    item.status === 'FAILED' && 'bg-red-100',
                    item.status === 'PENDING' && 'bg-amber-100',
                  )}>
                    {item.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : item.status === 'FAILED' ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.description}</p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(item.date), 'MMM d, yyyy')}
                      {item.paymentMethod && (
                        <span className="text-slate-400"> • {item.paymentMethod}</span>
                      )}
                      {item.cardLast4 && (
                        <span className="text-slate-400"> •••• {item.cardLast4}</span>
                      )}
                    </p>
                  </div>
                </div>
                {/* ✅ Removed download button - only showing amount now */}
                <span className="font-semibold text-slate-900">
                  {formatPrice(item.amount)}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500">No billing history yet</p>
              <p className="text-sm text-slate-400 mt-1">Your transactions will appear here</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Choose Your Plan</DialogTitle>
              <DialogDescription className="text-blue-100">
                Select a plan and billing cycle that works best for your business
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6">
            {/* Billing Cycle Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center bg-slate-100 rounded-full p-1">
                {(['MONTHLY', 'SEMI_ANNUAL', 'ANNUAL'] as BillingCycle[]).map((cycle) => {
                  const savings = getSavingsPercentage('PROFESSIONAL', cycle);
                  return (
                    <button
                      key={cycle}
                      onClick={() => setSelectedCycle(cycle)}
                      className={cn(
                        'relative px-4 py-2 rounded-full text-sm font-medium transition-all',
                        selectedCycle === cycle
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      {cycle === 'MONTHLY' ? 'Monthly' : cycle === 'SEMI_ANNUAL' ? '6 Months' : 'Yearly'}
                      {savings > 0 && (
                        <span className="ml-1 text-xs text-emerald-600 font-semibold">
                          -{savings}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['BASIC', 'PROFESSIONAL'] as BusinessPlan[]).map((plan) => {
                const planData = PLANS[plan];
                const price = getPlanPrice(plan, selectedCycle);
                const monthlyPrice = getMonthlyEquivalent(plan, selectedCycle);
                const Icon = planConfig[plan].icon;
                const isSelected = selectedPlan === plan;
                const isCurrent = plan === planType;

                return (
                  <motion.div
                    key={plan}
                    whileHover={{ scale: isCurrent ? 1 : 1.02 }}
                    whileTap={{ scale: isCurrent ? 1 : 0.98 }}
                    onClick={() => !isCurrent && setSelectedPlan(plan)}
                    className={cn(
                      'relative p-5 rounded-2xl border-2 transition-all cursor-pointer',
                      isCurrent
                        ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10'
                        : 'border-slate-200 hover:border-blue-300'
                    )}
                  >
                    {planData.popular && !isCurrent && (
                      <Badge className="absolute -top-2.5 right-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full">
                        Most Popular
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge className="absolute -top-2.5 right-4 bg-slate-500 text-white rounded-full">
                        Current Plan
                      </Badge>
                    )}

                    <div className="flex items-start gap-3 mb-4">
                      <div className={cn(
                        'p-2.5 rounded-xl',
                        plan === 'BASIC' ? 'bg-slate-100' : 'bg-blue-100'
                      )}>
                        <Icon className={cn(
                          'w-5 h-5',
                          plan === 'BASIC' ? 'text-slate-600' : 'text-blue-600'
                        )} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{planData.name}</h3>
                        <p className="text-xs text-slate-500">{planData.description}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">
                          {formatPrice(price)}
                        </span>
                        <span className="text-slate-500 text-sm">
                          /{selectedCycle === 'MONTHLY' ? 'mo' : selectedCycle === 'SEMI_ANNUAL' ? '6mo' : 'yr'}
                        </span>
                      </div>
                      {selectedCycle !== 'MONTHLY' && (
                        <p className="text-xs text-slate-500 mt-1">
                          {formatPrice(monthlyPrice)}/month when billed {selectedCycle === 'ANNUAL' ? 'annually' : 'semi-annually'}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {[
                        `${planData.limits.maxMonthlyOrders.toLocaleString()} orders/month`,
                        `${planData.limits.maxStaff} staff accounts`,
                        planData.features.workshopEnabled ? 'Workshop management' : null,
                        planData.features.multiStoreEnabled ? 'Multi-store support' : null,
                        planData.features.smsNotifications ? 'SMS notifications' : null,
                        planData.features.advancedReports ? 'Advanced reports' : null,
                      ].filter(Boolean).slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <Check className={cn(
                            'w-4 h-4 flex-shrink-0',
                            plan === 'BASIC' ? 'text-slate-500' : 'text-blue-500'
                          )} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {isSelected && !isCurrent && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Enterprise CTA */}
            <div className="mt-4 p-4 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Enterprise</h3>
                    <p className="text-sm text-slate-500">Custom solutions for large operations</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" asChild>
                  <a href="mailto:sales@laundrypro.com">Contact Sales</a>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Shield className="w-4 h-4" />
                Secure payment via Razorpay
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={!selectedPlan || selectedPlan === planType || checkoutLoading}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Upgrade to {PLANS[selectedPlan]?.name}
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll continue to have access until the end of your current billing period. After that, your account will be downgraded to the free tier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Help us improve (optional)
            </label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Why are you cancelling?"
              className="h-24 rounded-xl resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="rounded-full bg-red-600 hover:bg-red-700"
              disabled={cancelSubscription.isPending}
            >
              {cancelSubscription.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

function BillingPageSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-48 w-full rounded-3xl" />
    </div>
  );
}