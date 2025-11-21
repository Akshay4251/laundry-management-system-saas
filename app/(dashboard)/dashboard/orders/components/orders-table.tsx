'use client';

import Link from 'next/link';
import { MoreVertical, Eye, Edit, Trash2, Phone, MapPin, IndianRupee, Calendar as CalendarIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Order, PaymentMode } from '@/app/types/order';

interface OrdersTableProps {
  orders: Order[];
  onView: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onDelete: (orderId: string) => void;
}

export function OrdersTable({ orders, onView, onEdit, onDelete }: OrdersTableProps) {
  const getPaymentBadge = (mode: PaymentMode) => {
    const config = {
      cash: 'bg-green-100 text-green-700 border-green-200',
      card: 'bg-blue-100 text-blue-700 border-blue-200',
      upi: 'bg-purple-100 text-purple-700 border-purple-200',
      online: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return config[mode];
  };

  const getPaymentStatus = (total: number, paid: number) => {
    if (paid === 0) return { label: 'Unpaid', className: 'bg-red-100 text-red-700 border-red-200' };
    if (paid < total) return { label: 'Partial', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Paid', className: 'bg-green-100 text-green-700 border-green-200' };
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <Eye className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No orders found</h3>
        <p className="text-sm text-slate-500 mb-4">Try adjusting your filters or search query</p>
        <Link href="/dashboard/create-order">
          <Button size="sm">Create New Order</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => {
          const paymentStatus = getPaymentStatus(order.totalAmount, order.paidAmount);
          return (
            <div
              key={order.id}
              className="bg-white rounded-lg border border-slate-200 p-4 space-y-3"
            >
              {/* Header: Order ID + Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-mono font-bold text-blue-600 text-sm">
                    #{order.orderNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {format(order.orderDate, 'MMM dd, yyyy • hh:mm a')}
                  </div>
                </div>
                <StatusBadge status={order.status} size="sm" />
              </div>

              {/* Customer Info */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="font-semibold text-slate-900">{order.customer.name}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{order.customer.phone}</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{order.customer.address}</span>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Items</div>
                  <div className="font-semibold text-slate-900">{order.items} items</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Total Amount</div>
                  <div className="font-bold text-slate-900 flex items-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {order.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Payment</div>
                  <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border', getPaymentBadge(order.paymentMode))}>
                    {order.paymentMode.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Payment Status</div>
                  <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border', paymentStatus.className)}>
                    {paymentStatus.label}
                  </span>
                </div>
              </div>

              {/* Delivery Date */}
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-md p-2">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="font-medium">Delivery:</span>
                <span className="font-semibold text-slate-900">
                  {format(order.deliveryDate, 'MMM dd, yyyy • hh:mm a')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-slate-100 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(order.id)}
                  className="flex-1 h-9"
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(order.id)}
                  className="flex-1 h-9"
                >
                  <Edit className="w-4 h-4 mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(order.id)}
                  className="h-9 px-3 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-bold text-slate-700 whitespace-nowrap">Order ID</TableHead>
                <TableHead className="font-bold text-slate-700 whitespace-nowrap">Customer</TableHead>
                <TableHead className="font-bold text-slate-700 whitespace-nowrap">Items</TableHead>
                <TableHead className="font-bold text-slate-700 whitespace-nowrap">Amount</TableHead>
                <TableHead className="font-bold text-slate-700 whitespace-nowrap">Payment</TableHead>
                <TableHead className="font-bold text-slate-700 whitespace-nowrap">Status</TableHead>
                <TableHead className="font-bold text-slate-700 whitespace-nowrap">Order Date</TableHead>
                <TableHead className="font-bold text-slate-700 whitespace-nowrap">Delivery Date</TableHead>
                <TableHead className="font-bold text-slate-700 text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const paymentStatus = getPaymentStatus(order.totalAmount, order.paidAmount);
                return (
                  <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono font-bold text-blue-600 whitespace-nowrap">
                      #{order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 min-w-[180px]">
                        <div className="font-semibold text-slate-900">{order.customer.name}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="w-3 h-3" />
                          {order.customer.phone}
                        </div>
                        <div className="flex items-start gap-1 text-xs text-slate-500 max-w-[200px]">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{order.customer.address}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                        {order.items} items
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {order.totalAmount.toLocaleString('en-IN')}
                        </div>
                        {order.paidAmount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                            <IndianRupee className="w-3 h-3" />
                            {order.paidAmount.toLocaleString('en-IN')} paid
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border whitespace-nowrap', getPaymentBadge(order.paymentMode))}>
                          {order.paymentMode.toUpperCase()}
                        </span>
                        <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border whitespace-nowrap', paymentStatus.className)}>
                          {paymentStatus.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={order.status} size="md" />
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                      {format(order.orderDate, 'MMM dd, yyyy')}
                      <div className="text-xs text-slate-400">{format(order.orderDate, 'hh:mm a')}</div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {format(order.deliveryDate, 'MMM dd, yyyy')}
                      <div className="text-xs text-slate-500">{format(order.deliveryDate, 'hh:mm a')}</div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => onView(order.id)} className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(order.id)} className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(order.id)} 
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}