// app/(dashboard)/orders/components/order-details-sheet.tsx
'use client';

import { Order, PaymentMode } from '@/app/types/order';
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
  Zap,
  Factory,
} from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from './status-badge';

interface OrderDetailsSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  UPI: 'UPI',
  ONLINE: 'Online',
};

export default function OrderDetailsSheet({
  order,
  open,
  onOpenChange,
}: OrderDetailsSheetProps) {
  if (!order) return null;

  const isPaid = order.paidAmount >= order.totalAmount;
  const isPartial =
    order.paidAmount > 0 && order.paidAmount < order.totalAmount;
  const balance = order.dueAmount;
  const isExpress = order.priority === 'EXPRESS';

  const handlePrint = (type: 'invoice' | 'tags') => {
    window.open(
      `/orders/${order.id}/print/${type}`,
      '_blank',
      'width=800,height=600'
    );
  };

  const handleShare = () => {
    const message = `Order ${order.orderNumber}\nCustomer: ${order.customer.fullName}\nTotal: ₹${order.totalAmount}\nStatus: ${order.status}`;
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      (navigator as any).share({
        title: `Order ${order.orderNumber}`,
        text: message,
      });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(message);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-white">
        <SheetHeader className="space-y-4 pb-6">
          <div className="space-y-2">
            <SheetTitle className="text-2xl font-semibold flex items-center gap-3">
              #{order.orderNumber}
              {isExpress && (
                <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs font-bold">
                  <Zap className="w-3 h-3" />
                  Express
                </span>
              )}
            </SheetTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={order.status} />
              <Badge
                variant="outline"
                className={
                  isPaid
                    ? 'border-green-500 text-green-700'
                    : isPartial
                    ? 'border-yellow-500 text-yellow-700'
                    : 'border-red-500 text-red-700'
                }
              >
                {isPaid ? '✓ Paid' : isPartial ? 'Partial' : 'Unpaid'}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => handlePrint('invoice')}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => handlePrint('invoice')}
            >
              <Download className="w-4 h-4 mr-2" />
              Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Customer Information */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">
                {order.customer.fullName}
              </p>
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
              {order.customer.address && (
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span>{order.customer.address}</span>
                </div>
              )}
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
                  {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
              {order.deliveryDate && (
                <div className="space-y-1">
                  <p className="text-slate-500 text-xs">Delivery Date</p>
                  <p className="text-slate-900 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {format(new Date(order.deliveryDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-slate-500 text-xs">Total Items</p>
                <p className="text-slate-900 font-medium">
                  {order.totalItems} items
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-xs">Workshop Items</p>
                <p
                  className={
                    (order.workshopItems ?? 0) > 0
                      ? 'text-purple-600 font-medium'
                      : 'text-slate-900 font-medium'
                  }
                >
                  {(order.workshopItems ?? 0) > 0 && (
                    <Factory className="w-3 h-3 inline mr-1" />
                  )}
                  {order.workshopItems ?? 0}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Items Summary */}
          {order.itemsSummary && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Items</h3>
                {/* itemsSummary is an object, use .preview for display */}
                <p className="text-sm text-slate-600">
                  {order.itemsSummary.preview}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Payment Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Payment Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between font-semibold text-base">
                <span className="text-slate-900">Total Amount</span>
                <span className="text-slate-900">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
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
              {order.paymentMode && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Payment Method</span>
                  </div>
                  <span className="text-slate-900 font-medium">
                    {PAYMENT_MODE_LABELS[order.paymentMode]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 text-sm mb-2">
                Special Instructions
              </h3>
              <p className="text-sm text-yellow-800">
                {order.specialInstructions}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}