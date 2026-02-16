// app/(dashboard)/orders/[id]/components/order-info-cards.tsx
'use client';

import { OrderDetail, PaymentMode, getOrderDisplayAddress, getOrderAddressLabel } from '@/app/types/order';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Store,
  CheckCircle2,
  Navigation,
  Tag,
  Landmark,
  Truck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface OrderInfoCardsProps {
  order: OrderDetail;
}

const PAYMENT_MODE_CONFIG: Record<PaymentMode, { label: string; icon: string }> = {
  CASH: { label: 'Cash', icon: '💵' },
  CARD: { label: 'Card', icon: '💳' },
  UPI: { label: 'UPI', icon: '📱' },
  ONLINE: { label: 'Online', icon: '🌐' },
};

export function OrderInfoCards({ order }: OrderInfoCardsProps) {
  if (!order) return null;

  const paidAmount = order.paidAmount ?? 0;
  const totalAmount = order.totalAmount ?? 0;
  const isPaid = paidAmount >= totalAmount;
  const isPartial = paidAmount > 0 && paidAmount < totalAmount;
  const balance = order.dueAmount ?? (totalAmount - paidAmount);

  const displayAddress = getOrderDisplayAddress(order);
  const addressLabel = getOrderAddressLabel(order);
  const hasLinkedAddress = !!order.address;

  const formatCurrency = (amount: number | null | undefined): string => {
    return `₹${(amount ?? 0).toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Customer & Address Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 p-5"
      >
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Customer</h3>

        <div className="space-y-3">
          {/* Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {order.customer?.fullName || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Phone */}
          {order.customer?.phone && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-sm text-slate-600">{order.customer.phone}</p>
            </div>
          )}

          {/* Email */}
          {order.customer?.email && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-sm text-slate-600 truncate">{order.customer.email}</p>
            </div>
          )}

          {/* Linked Address (from CustomerAddress model) */}
          {hasLinkedAddress && order.address && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {order.orderType === 'PICKUP' ? 'Pickup / Delivery Address' : 'Customer Address'}
                </span>
                {addressLabel && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    <Tag className="w-3 h-3" />
                    {addressLabel}
                  </span>
                )}
              </div>
              <div className="bg-blue-50 rounded-xl p-3 space-y-2">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {order.address.fullAddress}
                </p>
                {order.address.landmark && (
                  <div className="flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500">
                      Landmark: {order.address.landmark}
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  {order.address.city} — {order.address.pincode}
                </p>
                {order.address.latitude && order.address.longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${order.address.latitude},${order.address.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Fallback: Customer's main address (no linked address) */}
          {!hasLinkedAddress && order.customer?.address && (
            <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{order.customer.address}</p>
            </div>
          )}

          {/* Store */}
          {order.store && (
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{order.store.name}</p>
                {order.store.address && (
                  <p className="text-xs text-slate-500 truncate">{order.store.address}</p>
                )}
              </div>
            </div>
          )}

          {/* Driver Info */}
          {order.driver && (
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{order.driver.fullName}</p>
                <p className="text-xs text-slate-500">{order.driver.phone} • Driver</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Payment Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Payment</h3>
          <Badge
            variant="outline"
            className={cn(
              'rounded-full text-xs font-medium',
              isPaid && 'bg-green-50 text-green-700 border-green-200',
              isPartial && 'bg-amber-50 text-amber-700 border-amber-200',
              !isPaid && !isPartial && 'bg-slate-50 text-slate-600 border-slate-200'
            )}
          >
            {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid'}
          </Badge>
        </div>

        <div className="space-y-3">
          {/* Subtotal */}
          {order.subtotal != null && order.subtotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
          )}

          {/* Discount */}
          {order.discount != null && order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Discount</span>
              <span className="text-green-600">-{formatCurrency(order.discount)}</span>
            </div>
          )}

          {/* Tax */}
          {order.tax != null && order.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tax</span>
              <span className="text-slate-900">{formatCurrency(order.tax)}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between pt-3 border-t border-slate-100">
            <span className="text-sm font-semibold text-slate-900">Total</span>
            <span className="text-sm font-semibold text-slate-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          {/* Paid & Balance */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="p-3 rounded-xl bg-slate-50 text-center">
              <p className="text-xs text-slate-500 mb-1">Paid</p>
              <p className="text-sm font-semibold text-green-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
            <div className={cn(
              "p-3 rounded-xl text-center",
              balance > 0 ? "bg-amber-50" : "bg-green-50"
            )}>
              <p className="text-xs text-slate-500 mb-1">Balance</p>
              <p className={cn(
                "text-sm font-semibold",
                balance > 0 ? "text-amber-600" : "text-green-600"
              )}>
                {balance > 0 ? formatCurrency(balance) : '—'}
              </p>
            </div>
          </div>

          {/* Payment Mode */}
          {order.paymentMode && (
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <span className="text-lg">{PAYMENT_MODE_CONFIG[order.paymentMode]?.icon}</span>
              <span className="text-sm text-slate-600">
                {PAYMENT_MODE_CONFIG[order.paymentMode]?.label}
              </span>
            </div>
          )}

          {/* Payment History */}
          {order.payments && order.payments.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">History</p>
              <div className="space-y-2 max-h-28 overflow-y-auto">
                {order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="font-medium text-slate-900">
                        ₹{payment.amount.toFixed(2)}
                      </span>
                      <span className="text-slate-400">• {payment.mode}</span>
                    </div>
                    <span className="text-slate-400">
                      {format(new Date(payment.createdAt), 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Delivery Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 p-5"
      >
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Delivery</h3>

        <div className="space-y-3">
          {order.deliveryDate ? (
            <>
              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {format(new Date(order.deliveryDate), 'EEE, MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-slate-500">Expected</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {format(new Date(order.deliveryDate), 'h:mm a')}
                  </p>
                  <p className="text-xs text-slate-500">Time</p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-6 text-center">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No delivery scheduled</p>
            </div>
          )}

          {/* Pickup Date (for PICKUP orders) */}
          {order.orderType === 'PICKUP' && order.pickupDate && (
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {format(new Date(order.pickupDate), 'EEE, MMM d, yyyy')}
                </p>
                <p className="text-xs text-slate-500">Pickup scheduled</p>
              </div>
            </div>
          )}

          {/* Assigned To */}
          {order.assignedTo && (
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{order.assignedTo}</p>
                <p className="text-xs text-slate-500">Assigned to</p>
              </div>
            </div>
          )}

          {/* Completed */}
          {order.completedDate && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-100 mt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Completed</p>
                  <p className="text-xs text-green-600">
                    {format(new Date(order.completedDate), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
            <div className="text-center py-2">
              <p className="text-lg font-semibold text-slate-900">{order.items?.length || 0}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Items</p>
            </div>
            <div className="text-center py-2">
              <p className="text-lg font-semibold text-slate-900">{order.stats?.totalQuantity || 0}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Pieces</p>
            </div>
            <div className="text-center py-2">
              <p className="text-lg font-semibold text-slate-900">{order.reworkCount || 0}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Reworks</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}