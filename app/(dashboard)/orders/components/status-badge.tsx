// app/(dashboard)/orders/components/status-badge.tsx

import { cn } from '@/lib/utils';
import { OrderStatus, ORDER_STATUS_CONFIG } from '@/app/types/order';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status];
  
  if (!config) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        'bg-slate-50 text-slate-600 border-slate-200',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      )}>
        {showDot && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        config.bgColor,
        config.color,
        config.borderColor,
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />}
      {config.label}
    </span>
  );
}

export default StatusBadge;