"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/app/types/order";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowRight,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface OrderActionsProps {
  order: Order;
}

// Updated Status Labels to match new Type
const STATUS_LABELS: Record<OrderStatus, string> = {
  pickup: "Pickup Scheduled",
  processing: "Processing",
  workshop: "At Workshop",
  ready: "Ready",
  delivery: "Out for Delivery",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function OrderActions({ order }: OrderActionsProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    // In production: await updateOrderStatus(order.id, status);
    setTimeout(() => {
      toast.success("Order status updated successfully");
      setIsUpdating(false);
    }, 1000);
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    toast.success("Note added successfully");
    setNote("");
  };

  const handleCancelOrder = () => {
    toast.error("Order cancelled");
  };

  // Updated Workflow Array
  const WORKFLOW: OrderStatus[] = ["pickup", "processing", "workshop", "ready", "delivery", "delivered", "completed"];

  const canProgressToNext = () => {
    const currentIndex = WORKFLOW.indexOf(order.status);
    return currentIndex >= 0 && currentIndex < WORKFLOW.length - 1;
  };

  const getNextStatus = (): OrderStatus | null => {
    const currentIndex = WORKFLOW.indexOf(order.status);
    return currentIndex >= 0 && currentIndex < WORKFLOW.length - 1 
      ? WORKFLOW[currentIndex + 1] 
      : null;
  };

  const nextStatus = getNextStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>

      {/* Update Status */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">
          Update Status
        </label>
        <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pickup">Pickup</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="workshop">At Workshop</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="w-full h-11 gap-2"
          onClick={handleUpdateStatus}
          disabled={isUpdating || status === order.status}
        >
          <CheckCircle className="w-4 h-4" />
          {isUpdating ? "Updating..." : "Update Status"}
        </Button>
      </div>

      {/* Quick Progress */}
      {canProgressToNext() && nextStatus && (
        <div className="pt-4 border-t border-slate-200">
          <Button 
            className="w-full h-11 gap-2" 
            variant="outline"
            onClick={() => {
              setStatus(nextStatus);
              handleUpdateStatus();
            }}
          >
            <ArrowRight className="w-4 h-4" />
            Move to {STATUS_LABELS[nextStatus]}
          </Button>
        </div>
      )}

      {/* Add Note */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <label className="text-sm font-medium text-slate-700">Add Note</label>
        <Textarea
          placeholder="Enter internal note or update..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <Button
          variant="outline"
          className="w-full h-11 gap-2"
          onClick={handleAddNote}
          disabled={!note.trim()}
        >
          <MessageSquare className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      {/* Cancel Order */}
      {order.status !== "completed" && order.status !== "cancelled" && (
        <div className="pt-4 border-t border-slate-200">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-11 gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                Cancel Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The order will be marked as
                  cancelled and the customer will be notified.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelOrder}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Cancel Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </motion.div>
  );
}