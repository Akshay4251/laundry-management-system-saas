'use client';

import { Eye, Edit, Trash2, Phone, IndianRupee, MoreVertical, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Order } from '@/app/types/order';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No orders found</h3>
        <p className="text-sm text-slate-500 mb-6">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[10%]" />
              <col className="w-[15%]" />
              <col className="w-[14%]" />
              <col className="w-[17%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[70px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                  Services
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                  Instructions
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="text-center py-4 px-2 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const isPaid = order.paidAmount >= order.totalAmount;

                return (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-semibold text-slate-900 truncate">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          {order.totalItems} items
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 truncate">
                          {order.customer.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{order.customer.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {order.services.map((service, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {order.specialInstructions ? (
                        <div className="flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700 line-clamp-2">
                            {order.specialInstructions}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{order.totalAmount.toLocaleString('en-IN')}</span>
                        </span>
                        <span className={cn(
                          'text-xs font-medium mt-0.5 truncate',
                          isPaid ? 'text-emerald-600' : 'text-amber-600'
                        )}>
                          {isPaid ? '✓ Paid' : `₹${(order.totalAmount - order.paidAmount).toLocaleString('en-IN')} due`}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={order.status} size="sm" />
                      {order.workshopItems > 0 && (
                        <div className="text-xs text-purple-600 font-medium mt-1">
                          {order.workshopItems} at workshop
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-sm truncate">
                          {format(order.deliveryDate, 'MMM dd, yyyy')}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 truncate">
                          {format(order.deliveryDate, 'hh:mm a')}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-2">
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                              <MoreVertical className="w-4 h-4 text-slate-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-lg">
                            <DropdownMenuItem
                              onClick={() => router.push(`/orders/${order.id}`)}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/orders/${order.id}/edit`)}
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this order?')) {
                                  console.log('Delete', order.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {orders.map((order) => {
          const isPaid = order.paidAmount >= order.totalAmount;

          return (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-sm font-semibold text-slate-900">
                    #{order.orderNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {order.totalItems} items
                  </div>
                </div>
                <StatusBadge status={order.status} size="sm" />
              </div>

              {/* Customer */}
              <div className="pt-4 border-t border-slate-100">
                <div className="font-medium text-slate-900 mb-2">{order.customer.name}</div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                  {order.customer.phone}
                </div>
              </div>

              {/* Services */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-medium text-slate-500 mb-2">Services</div>
                <div className="flex flex-wrap gap-1.5">
                  {order.services.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Special Instructions
                  </div>
                  <p className="text-sm text-slate-700">{order.specialInstructions}</p>
                </div>
              )}

              {/* Workshop Status */}
              {order.workshopItems > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                    {order.workshopItems} items at workshop
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Amount</div>
                  <div className="font-semibold text-slate-900 flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" />
                    {order.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div className={cn(
                    'text-xs font-medium mt-0.5',
                    isPaid ? 'text-emerald-600' : 'text-amber-600'
                  )}>
                    {isPaid ? '✓ Paid' : 'Unpaid'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Delivery</div>
                  <div className="font-medium text-slate-900">
                    {format(order.deliveryDate, 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {format(order.deliveryDate, 'hh:mm a')}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 h-11">
                      Actions
                      <MoreVertical className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48 bg-white border border-slate-200 shadow-lg">
                    <DropdownMenuItem
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(`/orders/${order.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Order
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() => {
                        if (confirm('Delete this order?')) {
                          console.log('Delete', order.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}