import { cn } from '@/lib/utils';
import { OrderStatus } from '@/app/types/order';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<OrderStatus, { label: string; className: string; dotColor: string }> = {
  pickup: { // <--- ADDED
    label: 'Pickup Scheduled',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
  },
  workshop: {
    label: 'At Workshop',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    dotColor: 'bg-purple-500',
  },
  ready: {
    label: 'Ready',
    className: 'bg-green-50 text-green-700 border-green-200',
    dotColor: 'bg-green-500',
  },
  delivery: {
    label: 'Out for Delivery',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  delivered: { // <--- ADDED
    label: 'Delivered',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
    dotColor: 'bg-teal-500',
  },
  completed: {
    label: 'Completed',
    className: 'bg-slate-50 text-slate-600 border-slate-200',
    dotColor: 'bg-slate-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-50 text-slate-600 border-slate-200',
    dotColor: 'bg-slate-400'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        config.className,
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  );
}