'use client';

import { Order } from '@/app/types/order';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Package,
  Printer,
  Download,
  Share2,
  CreditCard,
  IndianRupee,
} from 'lucide-react';
import { format } from 'date-fns';

interface OrderDetailsSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  new: { label: 'New Order', color: 'bg-blue-500' },
  processing: { label: 'Processing', color: 'bg-yellow-500' },
  workshop: { label: 'At Workshop', color: 'bg-purple-500' },
  ready: { label: 'Ready', color: 'bg-green-500' },
  delivery: { label: 'Out for Delivery', color: 'bg-orange-500' },
  completed: { label: 'Completed', color: 'bg-slate-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
};

const paymentModeLabels = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  online: 'Online',
};

export default function OrderDetailsSheet({
  order,
  open,
  onOpenChange,
}: OrderDetailsSheetProps) {
  if (!order) return null;

  const statusInfo = statusConfig[order.status];
  const paymentStatus =
    order.paidAmount === 0
      ? 'Unpaid'
      : order.paidAmount < order.totalAmount
      ? 'Partial'
      : 'Paid';
  const balance = order.totalAmount - order.paidAmount;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6">
          <div className="space-y-2">
            <SheetTitle className="text-2xl font-semibold">
              {order.orderNumber}
            </SheetTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className={`${statusInfo.color} text-white border-0`}
              >
                {statusInfo.label}
              </Badge>
              <Badge
                variant="outline"
                className={
                  paymentStatus === 'Paid'
                    ? 'border-green-500 text-green-700'
                    : paymentStatus === 'Partial'
                    ? 'border-yellow-500 text-yellow-700'
                    : 'border-red-500 text-red-700'
                }
              >
                {paymentStatus === 'Paid' ? '✓ Paid' : paymentStatus}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-9">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="w-4 h-4 mr-2" />
              Invoice
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Customer Information */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">{order.customer.name}</p>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                {order.customer.phone}
              </div>
              {order.customer.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {order.customer.email}
                </div>
              )}
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <span>{order.customer.address}</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Order Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-slate-500 text-xs">Order Date</p>
                <p className="text-slate-900 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-xs">Delivery Date</p>
                <p className="text-slate-900 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {format(new Date(order.deliveryDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-xs">Total Items</p>
                <p className="text-slate-900 font-medium">{order.totalItems}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-xs">Workshop Items</p>
                <p className="text-purple-600 font-medium">{order.workshopItems}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Services</h3>
            <div className="flex flex-wrap gap-2">
              {order.services.map((service, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs font-normal border-slate-300"
                >
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Payment Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between font-semibold text-base">
                <span className="text-slate-900">Total Amount</span>
                <span className="text-slate-900">₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Paid Amount</span>
                <span>₹{order.paidAmount.toFixed(2)}</span>
              </div>
              {balance > 0 && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Balance Due</span>
                  <span>₹{balance.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Payment Method</span>
                </div>
                <span className="text-slate-900 font-medium">
                  {paymentModeLabels[order.paymentMode]}
                </span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 text-sm mb-2">
                Special Instructions
              </h3>
              <p className="text-sm text-yellow-800">{order.specialInstructions}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}