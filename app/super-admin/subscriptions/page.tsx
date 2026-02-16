// app/(super-admin)/subscriptions/page.tsx

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Calendar,
  ShoppingBag,
  Store,
  Edit3,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuperAdminSubscriptions, useUpdateSubscription, useSuperAdminStats } from '@/app/hooks/use-super-admin';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const plans = ['TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'] as const;
const statuses = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'] as const;

export default function SubscriptionsPage() {
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<{ id: string; name: string; planType: string; planStatus: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data: stats } = useSuperAdminStats();
  const { data, isLoading, isError, refetch } = useSuperAdminSubscriptions({ plan: planFilter, status: statusFilter });
  const updateSubscription = useUpdateSubscription();

  const subscriptions = data?.items || [];
  const pagination = data?.pagination;

  const openEditDialog = (business: { id: string; businessName: string; planType: string; planStatus: string }) => {
    setEditingBusiness({ id: business.id, name: business.businessName, planType: business.planType, planStatus: business.planStatus });
    setSelectedPlan(business.planType);
    setSelectedStatus(business.planStatus);
  };

  const handleUpdate = async () => {
    if (editingBusiness) {
      await updateSubscription.mutateAsync({
        businessId: editingBusiness.id,
        planType: selectedPlan,
        planStatus: selectedStatus,
      });
      setEditingBusiness(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
        <p className="text-sm text-slate-500">Manage business plans and subscriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Trial', value: stats?.planDistribution.trial || 0, color: 'amber' },
          { label: 'Basic', value: stats?.planDistribution.basic || 0, color: 'green' },
          { label: 'Professional', value: stats?.planDistribution.professional || 0, color: 'blue' },
          { label: 'Enterprise', value: stats?.planDistribution.enterprise || 0, color: 'purple' },
        ].map(({ label, value, color }) => (
          <div key={label} className={cn(
            'rounded-2xl border p-4',
            color === 'amber' && 'bg-amber-50 border-amber-200',
            color === 'green' && 'bg-green-50 border-green-200',
            color === 'blue' && 'bg-blue-50 border-blue-200',
            color === 'purple' && 'bg-purple-50 border-purple-200',
          )}>
            <p className={cn(
              'text-sm font-medium',
              color === 'amber' && 'text-amber-600',
              color === 'green' && 'text-green-600',
              color === 'blue' && 'text-blue-600',
              color === 'purple' && 'text-purple-600',
            )}>{label}</p>
            <p className={cn(
              'text-2xl font-bold mt-1',
              color === 'amber' && 'text-amber-700',
              color === 'green' && 'text-green-700',
              color === 'blue' && 'text-blue-700',
              color === 'purple' && 'text-purple-700',
            )}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Plan Filter */}
        <div className="relative">
          <button
            onClick={() => { setIsPlanOpen(!isPlanOpen); setIsStatusOpen(false); }}
            className={cn(
              'h-10 px-4 rounded-full border bg-white flex items-center gap-2 transition-all text-sm',
              isPlanOpen ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <span className="text-slate-600">Plan:</span>
            <span className="font-medium text-slate-900">{planFilter === 'all' ? 'All' : planFilter}</span>
            <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', isPlanOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {isPlanOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsPlanOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50"
                >
                  {['all', ...plans].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => { setPlanFilter(plan); setIsPlanOpen(false); }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm',
                        planFilter === plan ? 'bg-red-50 text-red-700' : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <span>{plan === 'all' ? 'All Plans' : plan}</span>
                      {planFilter === plan && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => { setIsStatusOpen(!isStatusOpen); setIsPlanOpen(false); }}
            className={cn(
              'h-10 px-4 rounded-full border bg-white flex items-center gap-2 transition-all text-sm',
              isStatusOpen ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <span className="text-slate-600">Status:</span>
            <span className="font-medium text-slate-900">{statusFilter === 'all' ? 'All' : statusFilter}</span>
            <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', isStatusOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {isStatusOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50"
                >
                  {['all', ...statuses].map((status) => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setIsStatusOpen(false); }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm',
                        statusFilter === status ? 'bg-red-50 text-red-700' : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <span>{status === 'all' ? 'All Status' : status}</span>
                      {statusFilter === status && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-sm font-medium text-slate-900">Failed to load subscriptions</p>
            <button onClick={() => refetch()} className="mt-2 text-sm text-red-600 hover:text-red-700">Try again</button>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <CreditCard className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-900">No subscriptions found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {subscriptions.map((sub, index) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {sub.businessName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{sub.businessName}</p>
                    <p className="text-xs text-slate-500">{sub.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Store className="w-4 h-4" />
                      <span>{sub._count.stores}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4" />
                      <span>{sub._count.orders}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(sub.createdAt), 'MMM d, yyyy')}</span>
                  </div>

                  {/* Plan Badge */}
                  <span className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border',
                    sub.planType === 'ENTERPRISE' && 'bg-purple-100 text-purple-700 border-purple-200',
                    sub.planType === 'PROFESSIONAL' && 'bg-blue-100 text-blue-700 border-blue-200',
                    sub.planType === 'BASIC' && 'bg-green-100 text-green-700 border-green-200',
                    sub.planType === 'TRIAL' && 'bg-amber-100 text-amber-700 border-amber-200',
                  )}>
                    {sub.planType}
                  </span>

                  {/* Status Badge */}
                  <span className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    sub.planStatus === 'ACTIVE' && 'bg-green-100 text-green-700',
                    sub.planStatus === 'TRIAL' && 'bg-amber-100 text-amber-700',
                    sub.planStatus === 'SUSPENDED' && 'bg-red-100 text-red-700',
                    sub.planStatus === 'CANCELLED' && 'bg-slate-100 text-slate-700',
                  )}>
                    {sub.planStatus}
                  </span>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditDialog(sub)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center">
          <span className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} subscriptions)
          </span>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingBusiness} onOpenChange={() => setEditingBusiness(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update plan and status for {editingBusiness?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Plan Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Plan</label>
              <div className="grid grid-cols-2 gap-2">
                {plans.map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={cn(
                      'px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                      selectedPlan === plan
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    )}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={cn(
                      'px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                      selectedStatus === status
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBusiness(null)} className="rounded-full">
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateSubscription.isPending}
              className="rounded-full bg-red-600 hover:bg-red-700"
            >
              {updateSubscription.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}