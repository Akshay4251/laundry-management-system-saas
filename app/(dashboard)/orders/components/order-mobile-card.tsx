// app/(dashboard)/orders/components/order-mobile-card.tsx

'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Eye,
  MoreVertical,
  Phone,
  IndianRupee,
  Zap,
  Factory,
  Truck,
  RotateCcw,
  XCircle,
  RefreshCcw,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import {
  Order,
  OrderStatus,
  BusinessFeatures,
  getFeatureAwareForwardActions,
  getFeatureAwareReverseActions,
  canBeCancelled,
} from '@/app/types/order';

import type { DriverListItem } from '@/app/hooks/use-drivers';
import { DriverAssignmentCell } from './driver-assignment-cell';

const ICON_MAP: Record<string, any> = {
  CheckCircle2: Clock,
  Truck,
  Factory,
  RotateCcw,
  XCircle,
  RefreshCcw,
};

interface OrderMobileCardProps {
  order: Order;
  features: BusinessFeatures;

  // ✅ NEW
  drivers: DriverListItem[];
  driversLoading: boolean;

  onViewDetails: () => void;
  onStatusUpdate: (
    orderId: string,
    newStatus: OrderStatus,
    requiresConfirmation?: boolean,
    confirmMessage?: string,
    orderNumber?: string
  ) => void;
  onOpenSelectItems: (orderId: string, orderNumber: string) => void;
  onOpenSendAll: (orderId: string, orderNumber: string) => void;
  onCancelOrder: (orderId: string, orderNumber: string) => void;
  isUpdating: boolean;
  isCancelling: boolean;
}

export const OrderMobileCard = memo(function OrderMobileCard({
  order,
  features,
  drivers,
  driversLoading,
  onViewDetails,
  onStatusUpdate,
  onOpenSelectItems,
  onOpenSendAll,
  onCancelOrder,
  isUpdating,
  isCancelling,
}: OrderMobileCardProps) {
  const router = useRouter();
  const isPaid = order.paidAmount >= order.totalAmount;
  const isExpress = order.priority === 'EXPRESS';
  const isPickupOrder = order.orderType === 'PICKUP';
  const isRework = order.isRework;

  const forward = getFeatureAwareForwardActions(order.status, features);
  const reverse = getFeatureAwareReverseActions(order.status, features);

  const filteredForward = forward.filter(
    (a) => a.targetStatus !== 'AT_WORKSHOP' && a.targetStatus !== 'CANCELLED'
  );
  const filteredReverse = reverse.filter((a) => a.targetStatus !== 'AT_WORKSHOP');

  const showCancelOption = canBeCancelled(order.status);
  const showWorkshopActions =
    features.workshopEnabled && (order.status === 'IN_PROGRESS' || order.status === 'READY');

  return (
    <div
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
      onClick={() => router.push(`/orders/${order.id}`)}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold text-slate-900">#{order.orderNumber}</span>

            {isExpress && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-xs font-bold">
                <Zap className="w-3 h-3" />
              </span>
            )}

            {isPickupOrder && order.status === 'PICKUP' && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded text-xs font-bold">
                <Truck className="w-3 h-3" />
              </span>
            )}

            {isRework && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                <RefreshCcw className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">{order.totalItems} items</div>
        </div>

        <StatusBadge status={order.status} size="sm" />
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="font-medium text-slate-900 mb-2">{order.customer.fullName}</div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Phone className="w-3.5 h-3.5" /> {order.customer.phone}
        </div>
      </div>

      {/* ✅ Driver assignment */}
      <div className="pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className="text-xs text-slate-500 mb-2">Driver</div>
        <DriverAssignmentCell order={order} drivers={drivers} driversLoading={driversLoading} />
      </div>

      {(order.workshopItems ?? 0) > 0 && features.workshopEnabled && (
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 flex items-center gap-2">
            <Factory className="w-3.5 h-3.5" />
            {order.workshopItems} items at workshop
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <div className="text-xs text-slate-500 mb-1">Amount</div>
          <div className="font-semibold text-slate-900 flex items-center gap-0.5">
            <IndianRupee className="w-4 h-4" />
            {order.totalAmount.toLocaleString('en-IN')}
          </div>
          <div className={cn('text-xs font-medium mt-0.5', isPaid ? 'text-emerald-600' : 'text-amber-600')}>
            {isPaid ? '✓ Paid' : `₹${order.dueAmount.toLocaleString('en-IN')} due`}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">{order.status === 'PICKUP' ? 'Pickup' : 'Delivery'}</div>
          {order.status === 'PICKUP' && order.pickupDate ? (
            <>
              <div className="font-medium text-amber-700">
                {format(new Date(order.pickupDate), 'MMM dd, yyyy')}
              </div>
              <div className="text-xs text-amber-600 mt-0.5">
                {format(new Date(order.pickupDate), 'hh:mm a')}
              </div>
            </>
          ) : order.deliveryDate ? (
            <>
              <div className="font-medium text-slate-900">
                {format(new Date(order.deliveryDate), 'MMM dd, yyyy')}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {format(new Date(order.deliveryDate), 'hh:mm a')}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-400">Not set</div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
        <Button variant="outline" className="flex-1 h-11" onClick={onViewDetails}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 px-3">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 bg-white border border-slate-200 shadow-lg">
            {filteredForward.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-normal text-slate-400">
                  Progress Order
                </DropdownMenuLabel>

                {filteredForward.map((action) => {
                  const IconComponent = ICON_MAP[action.icon] || Clock;
                  const isPaymentRequired = action.requiresPayment && !isPaid;

                  return (
                    <DropdownMenuItem
                      key={action.targetStatus}
                      onClick={() =>
                        onStatusUpdate(
                          order.id,
                          action.targetStatus,
                          action.requiresConfirmation,
                          action.confirmMessage,
                          order.orderNumber
                        )
                      }
                      disabled={isPaymentRequired || isUpdating}
                      className={cn(action.color, isPaymentRequired && 'opacity-50')}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      <div className="flex flex-col">
                        <span>{action.label}</span>
                        {isPaymentRequired && (
                          <span className="text-[10px] text-red-500">Payment required</span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}

            {showWorkshopActions && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-semibold text-purple-600">
                  Workshop
                </DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => onOpenSelectItems(order.id, order.orderNumber)}
                  className="text-purple-600"
                >
                  <Factory className="w-4 h-4 mr-2" />
                  Send Selected Items
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onOpenSendAll(order.id, order.orderNumber)}
                  className="text-purple-700 font-medium"
                  disabled={isUpdating}
                >
                  <Factory className="w-4 h-4 mr-2" />
                  Send Entire Order
                </DropdownMenuItem>
              </>
            )}

            {filteredReverse.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-orange-500">
                  ↩ Go Back
                </DropdownMenuLabel>

                {filteredReverse.map((action) => {
                  const IconComponent = ICON_MAP[action.icon] || RotateCcw;

                  return (
                    <DropdownMenuItem
                      key={action.targetStatus}
                      onClick={() =>
                        onStatusUpdate(
                          order.id,
                          action.targetStatus,
                          action.requiresConfirmation,
                          action.confirmMessage,
                          order.orderNumber
                        )
                      }
                      disabled={isUpdating}
                      className={action.color}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}

            {showCancelOption && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50"
                  onClick={() => onCancelOrder(order.id, order.orderNumber)}
                  disabled={isCancelling}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Order
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});