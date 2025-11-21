import { cn } from '@/lib/utils';
import { 
  Clock, 
  Loader, 
  CheckCircle, 
  PackageCheck, 
  Truck, 
  CheckCircle2,
  XCircle,
  LucideIcon
} from 'lucide-react';
import { OrderStatus } from '@/app/types/order';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
  dotColor: string;
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  processing: {
    label: 'In Progress',
    icon: Loader,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
  },
  ready: {
    label: 'Ready',
    icon: CheckCircle,
    className: 'bg-green-50 text-green-700 border-green-200',
    dotColor: 'bg-green-500',
  },
  pickup: {
    label: 'Pickup',
    icon: PackageCheck,
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    dotColor: 'bg-purple-500',
  },
  delivery: {
    label: 'Out for Delivery',
    icon: Truck,
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-slate-100 text-slate-700 border-slate-300',
    dotColor: 'bg-slate-500',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-md border transition-all',
        config.className,
        sizeClasses[size]
      )}
    >
      <Icon className={cn(iconSizes[size], 'flex-shrink-0')} />
      <span>{config.label}</span>
    </span>
  );
}

// Helper to get status dot for minimal displays
export function StatusDot({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span className="relative flex h-2 w-2">
      <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', config.dotColor)} />
      <span className={cn('relative inline-flex rounded-full h-2 w-2', config.dotColor)} />
    </span>
  );
}