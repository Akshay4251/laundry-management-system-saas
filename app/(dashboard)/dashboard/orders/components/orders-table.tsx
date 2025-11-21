'use client';

import Link from 'next/link';
import { MoreVertical, Eye, Edit, Trash2, Phone, MapPin, IndianRupee } from 'lucide-react';
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
      <div className="text-center py-12">
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
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-bold text-slate-700">Order ID</TableHead>
            <TableHead className="font-bold text-slate-700">Customer</TableHead>
            <TableHead className="font-bold text-slate-700">Items</TableHead>
            <TableHead className="font-bold text-slate-700">Amount</TableHead>
            <TableHead className="font-bold text-slate-700">Payment</TableHead>
            <TableHead className="font-bold text-slate-700">Status</TableHead>
            <TableHead className="font-bold text-slate-700">Order Date</TableHead>
            <TableHead className="font-bold text-slate-700">Delivery Date</TableHead>
            <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const paymentStatus = getPaymentStatus(order.totalAmount, order.paidAmount);
            return (
              <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-mono font-bold text-blue-600">
                  #{order.orderNumber}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
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
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                    {order.items} items
                  </span>
                </TableCell>
                <TableCell>
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
                    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border', getPaymentBadge(order.paymentMode))}>
                      {order.paymentMode.toUpperCase()}
                    </span>
                    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border', paymentStatus.className)}>
                      {paymentStatus.label}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} size="md" />
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {format(order.orderDate, 'MMM dd, yyyy')}
                  <div className="text-xs text-slate-400">{format(order.orderDate, 'hh:mm a')}</div>
                </TableCell>
                <TableCell className="text-sm font-semibold text-slate-900">
                  {format(order.deliveryDate, 'MMM dd, yyyy')}
                  <div className="text-xs text-slate-500">{format(order.deliveryDate, 'hh:mm a')}</div>
                </TableCell>
                <TableCell className="text-right">
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
  );
}