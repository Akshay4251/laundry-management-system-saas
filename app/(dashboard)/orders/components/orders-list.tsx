'use client';

import { useState } from 'react';
import { Eye, Edit, Trash2, IndianRupee, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Order } from '@/app/types/order';
import { useRouter } from 'next/navigation';

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders }: OrdersListProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const groupedOrders = orders.reduce((groups, order) => {
    let dateLabel = format(order.orderDate, 'MMMM dd, yyyy');
    if (isToday(order.orderDate)) dateLabel = 'Today';
    if (isYesterday(order.orderDate)) dateLabel = 'Yesterday';

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(order);
    return groups;
  }, {} as Record<string, Order[]>);

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full border border-dashed border-slate-300 rounded-lg">
        <p className="text-sm text-slate-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-6 pb-6">
      {Object.entries(groupedOrders).map(([date, dateOrders]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="sticky top-0 bg-slate-50 -mx-6 px-6 py-2 mb-3 border-y border-slate-200 z-10">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              {date}
            </h3>
          </div>

          {/* Orders */}
          <div className="space-y-2">
            {dateOrders.map((order) => {
              const isSelected = selectedId === order.id;
              const isPaid = order.paidAmount >= order.totalAmount;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedId(isSelected ? null : order.id)}
                  className={cn(
                    'group border rounded-lg transition-all cursor-pointer',
                    isSelected
                      ? 'border-slate-300 bg-slate-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  )}
                >
                  {/* Compact Row */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      {/* Order Number & Customer */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm font-semibold text-slate-900">
                            #{order.orderNumber}
                          </span>
                          <StatusBadge status={order.status} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-medium text-slate-900">
                            {order.customer.name}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.customer.phone}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <div className="text-base font-semibold text-slate-900 flex items-center justify-end gap-0.5">
                          <IndianRupee className="w-4 h-4" />
                          {order.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <div className={cn(
                          'text-xs font-medium',
                          isPaid ? 'text-emerald-600' : 'text-amber-600'
                        )}>
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </div>
                      </div>

                      {/* Delivery */}
                      <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(order.deliveryDate, 'MMM dd')}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/orders/${order.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/orders/${order.id}/edit`);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this order?')) {
                              console.log('Delete', order.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isSelected && (
                    <div className="px-4 pb-3 pt-2 border-t border-slate-200 bg-slate-50/50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Total Items</div>
                          <div className="font-medium text-slate-900">{order.totalItems} items</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Payment</div>
                          <div className="font-medium text-slate-900 uppercase">{order.paymentMode}</div>
                        </div>
                        {order.workshopItems > 0 && (
                          <div>
                            <div className="text-xs text-slate-500 mb-1">At Workshop</div>
                            <div className="font-medium text-purple-700">{order.workshopItems} items</div>
                          </div>
                        )}
                        <div className="col-span-2">
                          <div className="text-xs text-slate-500 mb-1">Address</div>
                          <div className="text-slate-900">{order.customer.address}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}