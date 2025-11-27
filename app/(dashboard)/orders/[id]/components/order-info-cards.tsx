"use client";

import { Order } from "@/app/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Edit,
} from "lucide-react";
import { motion } from "framer-motion";

interface OrderInfoCardsProps {
  order: Order;
}

const PAYMENT_MODE_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  online: "Online",
};

export function OrderInfoCards({ order }: OrderInfoCardsProps) {
  const isPaid = order.paidAmount >= order.totalAmount;
  const isPartial = order.paidAmount > 0 && order.paidAmount < order.totalAmount;
  const balance = order.totalAmount - order.paidAmount;

  // Format date consistently
  const deliveryDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(order.deliveryDate);

  // Format time consistently with AM/PM in uppercase
  const deliveryTimeFormatted = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(order.deliveryDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Customer Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-slate-200 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Customer</h3>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-slate-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {order.customer.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-400" />
            <p className="text-sm text-slate-700">{order.customer.phone}</p>
          </div>

          {order.customer.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <p className="text-sm text-slate-700 truncate">{order.customer.email}</p>
            </div>
          )}

          <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
            <p className="text-sm text-slate-700">{order.customer.address}</p>
          </div>
        </div>
      </motion.div>

      {/* Payment Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-slate-200 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Payment</h3>
          <Badge
            variant="outline"
            className={
              isPaid
                ? "bg-green-100 text-green-700 border-green-200"
                : isPartial
                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                : "bg-orange-100 text-orange-700 border-orange-200"
            }
          >
            {isPaid ? "Paid" : isPartial ? "Partial" : "Unpaid"}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Subtotal</span>
            <span className="text-sm font-medium text-slate-900">
              ₹{order.totalAmount.toFixed(2)}
            </span>
          </div>

          {order.discount && order.discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Discount</span>
              <span className="text-sm font-medium text-green-600">
                -₹{order.discount.toFixed(2)}
              </span>
            </div>
          )}

          {order.tax && order.tax > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Tax</span>
              <span className="text-sm font-medium text-slate-900">
                ₹{order.tax.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-base font-semibold text-slate-900">Total</span>
            <span className="text-base font-semibold text-slate-900">
              ₹{order.totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Paid</span>
            <span className="font-medium text-green-600">
              ₹{order.paidAmount.toFixed(2)}
            </span>
          </div>

          {balance > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Balance</span>
              <span className="font-medium text-orange-600">
                ₹{balance.toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {PAYMENT_MODE_LABELS[order.paymentMode]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delivery Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-slate-200 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Delivery</h3>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {deliveryDateFormatted}
              </p>
              <p className="text-xs text-slate-500 mt-1">Expected delivery</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {deliveryTimeFormatted}
              </p>
              <p className="text-xs text-slate-500 mt-1">Delivery time</p>
            </div>
          </div>

          {order.assignedTo && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">
                Assigned To
              </p>
              <p className="text-sm text-slate-700">{order.assignedTo}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}