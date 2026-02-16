// app/(dashboard)/orders/components/order-row.tsx

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
  PackageCheck,
  RefreshCcw,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
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
  CheckCircle2: PackageCheck,
  Truck,
  Factory,
  RotateCcw,
  XCircle,
  PackageCheck,
  RefreshCcw,
};

interface OrderRowProps {
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

export const OrderTableRow = memo(function OrderTableRow({
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
}: OrderRowProps) {
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
    <tr
      className="transition-colors hover:bg-slate-50/70 cursor-pointer"
      onClick={() => router.push(`/orders/${order.id}`)}
    >
      <td className="py-4 px-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-sm font-semibold text-slate-900">
              #{order.orderNumber}
            </span>

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

          <span className="text-xs text-slate-500 mt-0.5">{order.totalItems} items</span>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 truncate">{order.customer.fullName}</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
            <Phone className="w-3 h-3 shrink-0" />
            <span className="truncate">{order.customer.phone}</span>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="text-sm text-slate-700 line-clamp-2">
          {order.itemsSummary?.preview ?? `${order.totalItems} items`}
        </div>

        {(order.workshopItems ?? 0) > 0 && features.workshopEnabled && (
          <div className="flex items-center gap-1 mt-1 text-xs text-purple-600">
            <Factory className="w-3 h-3" />
            {order.workshopItems} at workshop
          </div>
        )}
      </td>

      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 flex items-center gap-0.5">
            <IndianRupee className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{order.totalAmount.toLocaleString('en-IN')}</span>
          </span>

          <span
            className={cn(
              'text-xs font-medium mt-0.5',
              isPaid ? 'text-emerald-600' : 'text-amber-600'
            )}
          >
            {isPaid ? '✓ Paid' : `₹${order.dueAmount.toLocaleString('en-IN')} due`}
          </span>
        </div>
      </td>

      <td className="py-4 px-4">
        <StatusBadge status={order.status} size="sm" />
      </td>

      {/* ✅ NEW: Driver column */}
      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
        <DriverAssignmentCell order={order} drivers={drivers} driversLoading={driversLoading} />
      </td>

      <td className="py-4 px-4">
        {order.deliveryDate ? (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 text-sm truncate">
              {format(new Date(order.deliveryDate), 'MMM dd, yyyy')}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              {format(new Date(order.deliveryDate), 'hh:mm a')}
            </span>
          </div>
        ) : order.pickupDate && order.status === 'PICKUP' ? (
          <div className="flex flex-col">
            <span className="font-medium text-amber-700 text-sm">
              Pickup: {format(new Date(order.pickupDate), 'MMM dd')}
            </span>
            <span className="text-xs text-amber-600 mt-0.5">
              {format(new Date(order.pickupDate), 'hh:mm a')}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Not set</span>
        )}
      </td>

      <td className="py-4 px-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                <MoreVertical className="w-4 h-4 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 bg-white border border-slate-200 shadow-lg">
              <DropdownMenuItem onClick={onViewDetails} className="cursor-pointer font-medium">
                <Eye className="w-4 h-4 mr-2 text-slate-500" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {filteredForward.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs font-normal text-slate-400">
                    Progress Order
                  </DropdownMenuLabel>

                  {filteredForward.map((action) => {
                    const IconComponent = ICON_MAP[action.icon] || PackageCheck;
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
                        className={cn('cursor-pointer', action.color, isPaymentRequired && 'opacity-50')}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        <div className="flex flex-col">
                          <span>{action.label}</span>
                          {action.description && (
                            <span className="text-[10px] text-slate-500">{action.description}</span>
                          )}
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
                  <DropdownMenuLabel className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                    <Factory className="w-3 h-3" />
                    Workshop
                  </DropdownMenuLabel>

                  <DropdownMenuItem
                    onClick={() => onOpenSelectItems(order.id, order.orderNumber)}
                    className="cursor-pointer text-purple-600 focus:text-purple-600 focus:bg-purple-50"
                  >
                    <Factory className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Send Selected Items</span>
                      <span className="text-[10px] text-slate-500">Choose specific items</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onOpenSendAll(order.id, order.orderNumber)}
                    className="cursor-pointer text-purple-700 focus:text-purple-700 focus:bg-purple-100 font-medium"
                    disabled={isUpdating}
                  >
                    <Factory className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Send Entire Order</span>
                      <span className="text-[10px] text-slate-500">All items to workshop</span>
                    </div>
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
                        className={cn('cursor-pointer', action.color)}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        <div className="flex flex-col">
                          <span>{action.label}</span>
                          {action.description && (
                            <span className="text-[10px] text-slate-500">{action.description}</span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </>
              )}

              {showCancelOption && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
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
      </td>
    </tr>
  );
});