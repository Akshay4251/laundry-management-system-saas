//app/(dashboard)/orders/[id]/components/order-timeline.tsx
'use client';

import { OrderDetail, OrderStatus, ORDER_STATUS_CONFIG } from '@/app/types/order';
import { 
  Check, 
  Clock, 
  Circle, 
  X, 
  Truck, 
  Factory, 
  Package,
  PackageCheck,
  Loader2,
  UserCheck,
  RefreshCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderTimelineProps {
  order: OrderDetail;
}

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  PICKUP: Truck,
  IN_PROGRESS: Loader2,
  AT_WORKSHOP: Factory,
  WORKSHOP_RETURNED: PackageCheck,
  READY: Package,
  OUT_FOR_DELIVERY: Truck,
  COMPLETED: UserCheck,
  CANCELLED: X,
};

const getWorkflowSteps = (order: OrderDetail): { 
  key: OrderStatus; 
  label: string; 
  description: string;
}[] => {
  const orderType = order.orderType || 'WALKIN';
  const statusHistory = new Set(order.statusHistory?.map(h => h.toStatus) || []);
  const hasWorkshop = statusHistory.has('AT_WORKSHOP') || (order.stats?.atWorkshopItems || 0) > 0;
  const hasWorkshopReturned = statusHistory.has('WORKSHOP_RETURNED');
  const hasDelivery = statusHistory.has('OUT_FOR_DELIVERY');
  const isRework = order.isRework;

  const steps: { key: OrderStatus; label: string; description: string }[] = [];

  if (orderType === 'PICKUP') {
    steps.push({ key: 'PICKUP', label: 'Pickup Scheduled', description: 'Awaiting pickup from customer' });
  }

  steps.push({ 
    key: 'IN_PROGRESS', 
    label: isRework ? 'Reprocessing' : 'Processing', 
    description: isRework ? 'Order sent back for rework' : 'Being cleaned/ironed' 
  });

  if (hasWorkshop) {
    steps.push({ key: 'AT_WORKSHOP', label: 'At Workshop', description: 'Items at external workshop' });
  }

  if (hasWorkshopReturned) {
    steps.push({ key: 'WORKSHOP_RETURNED', label: 'Workshop QC', description: 'Items returned, quality check' });
  }

  steps.push({ key: 'READY', label: 'Ready', description: 'Ready for customer' });

  if (hasDelivery) {
    steps.push({ key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'Being delivered' });
  }

  steps.push({ key: 'COMPLETED', label: 'Completed', description: 'Successfully delivered' });

  return steps;
};

export function OrderTimeline({ order }: OrderTimelineProps) {
  const isCancelled = order.status === 'CANCELLED';
  
  const steps = isCancelled 
    ? [{ key: 'CANCELLED' as OrderStatus, label: 'Order Cancelled', description: 'This order was cancelled' }]
    : getWorkflowSteps(order);

  const currentStepIndex = steps.findIndex((step) => step.key === order.status);

  const getStepState = (index: number) => {
    if (isCancelled) return 'cancelled';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const getStepTimestamp = (status: OrderStatus) => {
    const historyItem = order.statusHistory?.find(h => h.toStatus === status);
    return historyItem ? new Date(historyItem.createdAt) : null;
  };

  const getStepIcon = (step: { key: OrderStatus }, state: string) => {
    if (state === 'completed') return <Check className="w-5 h-5" />;
    if (state === 'cancelled') return <X className="w-5 h-5" />;
    
    const IconComponent = STATUS_ICONS[step.key] || Circle;
    
    if (state === 'current' && step.key === 'IN_PROGRESS') {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Order Progress</h2>
        <div className="flex items-center gap-2">
          {order.isRework && (
            <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" />
              Rework #{order.reworkCount}
            </span>
          )}
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {order.orderType === 'PICKUP' ? '📦 Pickup Order' : '🏪 Walk-in Order'}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
        
        {!isCancelled && currentStepIndex >= 0 && (
          <motion.div
            className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-blue-600 to-blue-400"
            initial={{ height: '0%' }}
            animate={{
              height: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}

        <div className="space-y-8 relative">
          {steps.map((step, index) => {
            const state = getStepState(index);
            const timestamp = getStepTimestamp(step.key);
            const config = ORDER_STATUS_CONFIG[step.key];

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div
                  className={cn(
                    'relative z-10 w-12 h-12 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300',
                    state === 'completed' && 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200',
                    state === 'current' && 'bg-white border-blue-600 text-blue-600 shadow-lg shadow-blue-100',
                    state === 'upcoming' && 'bg-white border-slate-200 text-slate-400',
                    state === 'cancelled' && 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200'
                  )}
                >
                  {getStepIcon(step, state)}
                </div>

                <div className="flex-1 pt-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={cn(
                        'font-semibold',
                        state === 'completed' && 'text-slate-900',
                        state === 'current' && 'text-blue-600',
                        state === 'upcoming' && 'text-slate-400',
                        state === 'cancelled' && 'text-red-600'
                      )}
                    >
                      {step.label}
                    </p>
                    {state === 'current' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium animate-pulse">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-500 mt-0.5">
                    {state === 'completed' && timestamp && `Completed on ${format(timestamp, 'MMM d, yyyy')}`}
                    {state === 'current' && step.description}
                    {state === 'upcoming' && 'Pending'}
                    {state === 'cancelled' && 'Order was cancelled'}
                  </p>
                </div>

                {(state === 'completed' || state === 'current') && timestamp && (
                  <div className="text-xs text-slate-400 pt-2 flex-shrink-0 px-2 py-1 bg-slate-50 rounded-full">
                    {format(timestamp, 'h:mm a')}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Activity Log */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Activity Log
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {order.statusHistory.map((history) => {
              const toConfig = ORDER_STATUS_CONFIG[history.toStatus];
              const fromConfig = history.fromStatus ? ORDER_STATUS_CONFIG[history.fromStatus] : null;
              
              return (
                <div key={history.id} className="flex items-start gap-3 text-sm group p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-all',
                    toConfig?.dotColor || 'bg-slate-300',
                    'group-hover:scale-125'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900">
                      {fromConfig ? (
                        <>
                          <span className={cn('font-medium', fromConfig.color)}>{fromConfig.label}</span>
                          <span className="text-slate-400 mx-1">→</span>
                        </>
                      ) : (
                        <span className="text-slate-400">Started as </span>
                      )}
                      <span className={cn('font-medium', toConfig?.color)}>{toConfig?.label || history.toStatus}</span>
                    </p>
                    {history.notes && (
                      <p className="text-slate-500 text-xs mt-0.5 italic">"{history.notes}"</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0 px-2 py-0.5 bg-slate-100 rounded-full">
                    {format(new Date(history.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}