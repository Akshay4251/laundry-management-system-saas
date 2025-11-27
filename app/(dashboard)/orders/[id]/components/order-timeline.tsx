"use client";

import { Order, OrderStatus } from "@/app/types/order";
import { Check, Clock, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrderTimelineProps {
  order: Order;
}

const WORKFLOW_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "new", label: "Order Received" },
  { key: "processing", label: "Processing at Center" },
  { key: "workshop", label: "At Workshop" },
  { key: "ready", label: "Ready for Delivery" },
  { key: "delivery", label: "Out for Delivery" },
  { key: "completed", label: "Completed" },
];

// Utility function for consistent date formatting
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export function OrderTimeline({ order }: OrderTimelineProps) {
  // Filter out cancelled from normal workflow
  const steps = order.status === 'cancelled' 
    ? [{ key: "cancelled" as OrderStatus, label: "Order Cancelled" }]
    : WORKFLOW_STEPS;

  const currentStepIndex = steps.findIndex((step) => step.key === order.status);

  const getStepState = (index: number) => {
    if (order.status === 'cancelled') return index === 0 ? 'cancelled' : 'skipped';
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">
        Order Progress
      </h2>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
        {order.status !== 'cancelled' && (
          <motion.div
            className="absolute left-6 top-0 w-0.5 bg-blue-600"
            initial={{ height: "0%" }}
            animate={{
              height: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}

        {/* Steps */}
        <div className="space-y-8 relative">
          {steps.map((step, index) => {
            const state = getStepState(index);
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    state === "completed" && "bg-blue-600 border-blue-600 text-white",
                    state === "current" && "bg-white border-blue-600 text-blue-600",
                    state === "upcoming" && "bg-white border-slate-200 text-slate-400",
                    state === "cancelled" && "bg-red-600 border-red-600 text-white"
                  )}
                >
                  {state === "completed" && <Check className="w-5 h-5" />}
                  {state === "current" && <Clock className="w-5 h-5" />}
                  {(state === "upcoming" || state === "skipped") && <Circle className="w-5 h-5" />}
                  {state === "cancelled" && <Circle className="w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <p
                    className={cn(
                      "font-medium mb-1",
                      state === "completed" && "text-slate-900",
                      state === "current" && "text-blue-600",
                      state === "upcoming" && "text-slate-400",
                      state === "cancelled" && "text-red-600"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-sm text-slate-500">
                    {state === "completed" && `Completed on ${formatDate(order.orderDate)}`}
                    {state === "current" && "Currently in progress"}
                    {state === "upcoming" && "Pending"}
                    {state === "cancelled" && "Order was cancelled"}
                  </p>
                </div>

                {/* Timestamp */}
                {state === "completed" && (
                  <div className="text-xs text-slate-400 pt-2">
                    {formatTime(order.orderDate)}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}