// app/(dashboard)/orders/[id]/components/order-actions.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  OrderDetail,
  OrderStatus,
  PaymentMode,
  getForwardActions,
  getReverseActions,
  getFeatureAwareForwardActions,
  getFeatureAwareReverseActions,
  ORDER_STATUS_CONFIG,
  isTerminalStatus,
  isCompletedStatus,
  canBeCancelled,
  isPickupAwaitingItems,
  canAddItemsToOrder,
  BusinessFeatures,
} from '@/app/types/order';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Loader2,
  Truck,
  Factory,
  RotateCcw,
  PackageCheck,
  RefreshCcw,
  UserCheck,
  AlertTriangle,
  Package,
  Sparkles,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useUpdateOrderStatus,
  useAddPayment,
  useCancelOrder,
  useSendItemsToWorkshop,
} from '@/app/hooks/use-orders';
import { useBusinessFeatures } from '@/app/hooks/use-business-features';
import { SendToWorkshopModal } from '@/components/workshop/send-to-workshop-modal';
import { AddItemsModal } from './add-items-modal';
import { cn } from '@/lib/utils';

interface OrderActionsProps {
  order: OrderDetail;
  onRefresh?: () => void;
}

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  CheckCircle2,
  Truck,
  Factory,
  RotateCcw,
  XCircle,
  PackageCheck,
  RefreshCcw,
  UserCheck,
  Package,
  Loader2,
  AlertTriangle,
};

export function OrderActions({ order, onRefresh }: OrderActionsProps) {
  const router = useRouter();
  
  // State
  const [note, setNote] = useState('');
  const [reworkReason, setReworkReason] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [workshopPartnerName, setWorkshopPartnerName] = useState('');
  const [workshopNotes, setWorkshopNotes] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [showReworkDialog, setShowReworkDialog] = useState(false);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);

  // Hooks
  const { features, workshopEnabled, deliveryEnabled } = useBusinessFeatures();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus();
  const { mutate: addPayment, isPending: isAddingPayment } = useAddPayment();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  const { mutate: sendToWorkshop, isPending: isSendingToWorkshop } = useSendItemsToWorkshop();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse" />;
  }

  // Default features if not loaded
  const activeFeatures: BusinessFeatures = features || {
    pickupEnabled: true,
    deliveryEnabled: true,
    workshopEnabled: true,
  };

  // Get dynamic actions based on current status AND features
  const forwardActions = getFeatureAwareForwardActions(order.status, activeFeatures);
  const reverseActions = getFeatureAwareReverseActions(order.status, activeFeatures);
  
  const dueAmount = order.dueAmount ?? (order.totalAmount - order.paidAmount);
  const isTerminal = isTerminalStatus(order.status);
  const isCompleted = isCompletedStatus(order.status);
  const currentConfig = ORDER_STATUS_CONFIG[order.status];

  // Check pickup/items status
  const isAwaitingItems = isPickupAwaitingItems(order);
  const canAddItems = canAddItemsToOrder(order);

  // Check if we can send items to workshop (only in IN_PROGRESS and workshop enabled)
  const canSendToWorkshop = workshopEnabled && order.status === 'IN_PROGRESS';
  const workshopEligibleItems = order.items?.filter(
    (item) => ['RECEIVED', 'IN_PROGRESS'].includes(item.status) && !item.sentToWorkshop
  ) || [];

  // Check if items are at workshop (for going back to workshop option)
  const hasWorkshopHistory = order.items?.some(item => item.sentToWorkshop) || false;

  // Filter out AT_WORKSHOP from forward actions if handled separately with modal
  const filteredForwardActions = forwardActions.filter(
    (action) => action.targetStatus !== 'AT_WORKSHOP'
  );

  // Filter out AT_WORKSHOP from reverse actions if no workshop history
  const filteredReverseActions = reverseActions.filter(
    (action) => action.targetStatus !== 'AT_WORKSHOP' || hasWorkshopHistory
  );

  // Handlers
  const handleStatusUpdate = (
    newStatus: OrderStatus,
    notes?: string,
    reason?: string
  ) => {
    updateStatus(
      {
        id: order.id,
        status: newStatus,
        notes,
        reason,
        workshopPartnerName: workshopPartnerName || undefined,
        workshopNotes: workshopNotes || undefined,
      },
      {
        onSuccess: () => {
          onRefresh?.();
        },
      }
    );
    setNote('');
    setReworkReason('');
    setWorkshopPartnerName('');
    setWorkshopNotes('');
  };

  const handleSendItemsToWorkshop = (
    itemIds: string[],
    partnerName?: string,
    notes?: string
  ) => {
    sendToWorkshop(
      {
        orderId: order.id,
        itemIds,
        workshopPartnerName: partnerName,
        workshopNotes: notes,
      },
      {
        onSuccess: () => {
          onRefresh?.();
        },
      }
    );
  };

  const handleSendAllToWorkshop = () => {
    updateStatus(
      {
        id: order.id,
        status: 'AT_WORKSHOP',
        notes: 'All items sent to workshop',
        workshopPartnerName: workshopPartnerName || 'External Workshop',
        workshopNotes: workshopNotes || undefined,
      },
      {
        onSuccess: () => {
          onRefresh?.();
        },
      }
    );
    setWorkshopPartnerName('');
    setWorkshopNotes('');
  };

  const handleReworkSubmit = () => {
    handleStatusUpdate('IN_PROGRESS', undefined, reworkReason);
    setShowReworkDialog(false);
  };

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    addPayment(
      {
        orderId: order.id,
        amount,
        mode: paymentMode,
      },
      {
        onSuccess: () => {
          onRefresh?.();
        },
      }
    );
    setPaymentAmount('');
  };

  const handleCancelOrder = () => {
    cancelOrder(order.id, {
      onSuccess: () => router.push('/orders'),
    });
  };

  const handleAddItemsSuccess = () => {
    onRefresh?.();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <p className="text-sm text-slate-500">Manage this order</p>
          </div>
        </div>

        {/* Current Status */}
        <div className={cn(
          "p-4 rounded-2xl border",
          currentConfig?.bgColor,
          currentConfig?.borderColor
        )}>
          <p className="text-xs font-medium text-slate-500 mb-1">Current Status</p>
          <p className={cn("font-semibold", currentConfig?.color)}>
            {currentConfig?.label || order.status}
          </p>
          <p className="text-xs text-slate-500 mt-1">{currentConfig?.description}</p>

          {/* Show item breakdown */}
          {order.stats && (
            <div className="mt-3 pt-3 border-t border-slate-200/50 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">In Progress:</span>
                <span className="ml-1 font-medium">{order.stats.inProgressItems || 0}</span>
              </div>
              <div>
                <span className="text-slate-500">At Workshop:</span>
                <span className="ml-1 font-medium">{order.stats.atWorkshopItems || 0}</span>
              </div>
              <div>
                <span className="text-slate-500">Ready:</span>
                <span className="ml-1 font-medium">{order.stats.readyItems || 0}</span>
              </div>
              <div>
                <span className="text-slate-500">Completed:</span>
                <span className="ml-1 font-medium">{order.stats.completedItems || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Rework indicator */}
        {order.isRework && (
          <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200">
            <div className="flex items-center gap-2 text-orange-700">
              <RefreshCcw className="w-4 h-4" />
              <span className="text-sm font-medium">
                Rework Order (#{order.reworkCount || 1})
              </span>
            </div>
            {order.reworkReason && (
              <p className="text-xs text-orange-600 mt-1">{order.reworkReason}</p>
            )}
          </div>
        )}

        {/* ADD ITEMS SECTION - For PICKUP orders awaiting items */}
        {isAwaitingItems && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900">Pickup Order</h4>
                <p className="text-sm text-amber-700">
                  Items haven't been added yet. Add items after pickup.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddItemsModal(true)}
              className="w-full h-12 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Items Now
            </Button>
          </div>
        )}

        {/* Regular Add Items button for IN_PROGRESS orders */}
        {canAddItems && !isAwaitingItems && (
          <Button
            variant="outline"
            onClick={() => setShowAddItemsModal(true)}
            className="w-full h-11 gap-2 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4" />
            Add More Items
          </Button>
        )}

        {/* FORWARD ACTIONS (Progress Order) */}
        {!isTerminal && filteredForwardActions.length > 0 && !isAwaitingItems && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Progress Order
            </label>
            <div className="grid gap-2">
              {filteredForwardActions.map((action) => {
                const IconComponent = ICON_MAP[action.icon] || CheckCircle2;
                const isPaid = order.paidAmount >= order.totalAmount;
                const isDisabled = action.requiresPayment && !isPaid;

                // Special handling for rework action (COMPLETED → IN_PROGRESS)
                if (action.targetStatus === 'IN_PROGRESS' && isCompleted) {
                  return (
                    <AlertDialog key={action.targetStatus} open={showReworkDialog} onOpenChange={setShowReworkDialog}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start gap-3 rounded-xl",
                            action.color
                          )}
                          disabled={isUpdatingStatus}
                        >
                          <IconComponent className="w-4 h-4" />
                          <div className="text-left">
                            <span>{action.label}</span>
                            <span className="block text-xs text-slate-500">{action.description}</span>
                          </div>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <RefreshCcw className="w-5 h-5 text-orange-600" />
                            Reprocess Order?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will send the order back for reprocessing. Please provide a reason.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Textarea
                            placeholder="Reason for reprocessing (e.g., stain not removed, wrong item, customer complaint)..."
                            value={reworkReason}
                            onChange={(e) => setReworkReason(e.target.value)}
                            className="min-h-[100px] rounded-xl"
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleReworkSubmit}
                            className="bg-orange-600 hover:bg-orange-700 rounded-full"
                            disabled={!reworkReason.trim()}
                          >
                            Send for Reprocessing
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  );
                }

                return (
                  <Button
                    key={action.targetStatus}
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start gap-3 rounded-xl",
                      action.color,
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isUpdatingStatus || isDisabled}
                    onClick={() => {
                      if (action.requiresConfirmation) {
                        if (confirm(action.confirmMessage || `Are you sure you want to ${action.label}?`)) {
                          handleStatusUpdate(action.targetStatus, note || undefined);
                        }
                      } else {
                        handleStatusUpdate(action.targetStatus, note || undefined);
                      }
                    }}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                    <div className="text-left">
                      <span>{action.label}</span>
                      {action.description && (
                        <span className="block text-xs text-slate-500">{action.description}</span>
                      )}
                      {isDisabled && (
                        <span className="block text-xs text-red-500">Payment required first</span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* WORKSHOP SECTION (Only when IN_PROGRESS and workshop enabled) */}
        {canSendToWorkshop && workshopEligibleItems.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Factory className="w-4 h-4 text-purple-600" />
              Workshop
            </label>

            <Input
              placeholder="Workshop partner name (optional)"
              value={workshopPartnerName}
              onChange={(e) => setWorkshopPartnerName(e.target.value)}
              className="h-10 rounded-xl"
            />

            <div className="grid gap-2">
              <SendToWorkshopModal
                items={order.items || []}
                onConfirm={handleSendItemsToWorkshop}
                isLoading={isSendingToWorkshop}
                trigger={
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start gap-3 text-purple-600 border-purple-200 hover:bg-purple-50 rounded-xl"
                  >
                    <Factory className="w-4 h-4" />
                    <div className="text-left">
                      <span>Send Selected Items</span>
                      <span className="block text-xs text-slate-500">
                        Choose specific items ({workshopEligibleItems.length} available)
                      </span>
                    </div>
                  </Button>
                }
              />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start gap-3 text-purple-700 border-purple-300 hover:bg-purple-100 rounded-xl"
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Factory className="w-4 h-4" />
                    )}
                    <div className="text-left">
                      <span>Send Entire Order to Workshop</span>
                      <span className="block text-xs text-slate-500">
                        All {workshopEligibleItems.length} items
                      </span>
                    </div>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Send All Items to Workshop?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will send all {workshopEligibleItems.length} items to the external workshop.
                      The order status will change to "At Workshop".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4 space-y-3">
                    <Input
                      placeholder="Workshop partner name"
                      value={workshopPartnerName}
                      onChange={(e) => setWorkshopPartnerName(e.target.value)}
                      className="rounded-xl"
                    />
                    <Textarea
                      placeholder="Special instructions for workshop..."
                      value={workshopNotes}
                      onChange={(e) => setWorkshopNotes(e.target.value)}
                      className="min-h-[80px] rounded-xl"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSendAllToWorkshop}
                      className="bg-purple-600 hover:bg-purple-700 rounded-full"
                    >
                      Send All to Workshop
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {/* REVERSE ACTIONS (Go Back) */}
        {!isTerminal && filteredReverseActions.length > 0 && !isAwaitingItems && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <label className="text-sm font-medium text-orange-600 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Go Back
            </label>
            <div className="grid gap-2">
              {filteredReverseActions.map((action) => {
                const IconComponent = ICON_MAP[action.icon] || RotateCcw;

                return (
                  <Button
                    key={action.targetStatus}
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start gap-3 border-orange-200 hover:bg-orange-50 rounded-xl",
                      action.color
                    )}
                    disabled={isUpdatingStatus}
                    onClick={() => {
                      if (action.requiresConfirmation) {
                        if (confirm(action.confirmMessage || `Are you sure you want to ${action.label}?`)) {
                          handleStatusUpdate(action.targetStatus, note || undefined);
                        }
                      } else {
                        handleStatusUpdate(action.targetStatus, note || undefined);
                      }
                    }}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                    <div className="text-left">
                      <span>{action.label}</span>
                      {action.description && (
                        <span className="block text-xs text-slate-500">{action.description}</span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* ADD PAYMENT */}
        {dueAmount > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                Add Payment
              </label>
              <span className="text-sm text-orange-600 font-medium px-3 py-1 bg-orange-50 rounded-full">
                Due: ₹{dueAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="pl-9 h-11 rounded-xl"
                  max={dueAmount}
                />
              </div>
              <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)}>
                <SelectTrigger className="w-28 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="CASH">💵 Cash</SelectItem>
                  <SelectItem value="CARD">💳 Card</SelectItem>
                  <SelectItem value="UPI">📱 UPI</SelectItem>
                  <SelectItem value="ONLINE">🌐 Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(dueAmount.toString())}
                className="flex-1 rounded-full"
              >
                Full Amount
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount((dueAmount / 2).toFixed(2))}
                className="flex-1 rounded-full"
              >
                50%
              </Button>
            </div>

            <Button
              className="w-full h-11 gap-2 bg-green-600 hover:bg-green-700 rounded-full"
              onClick={handleAddPayment}
              disabled={isAddingPayment || !paymentAmount}
            >
              {isAddingPayment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <IndianRupee className="w-4 h-4" />
              )}
              {isAddingPayment ? 'Processing...' : 'Record Payment'}
            </Button>
          </div>
        )}

        {/* Payment Complete Indicator */}
        {dueAmount <= 0 && order.totalAmount > 0 && (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Payment Complete</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Total paid: ₹{order.paidAmount.toFixed(2)}
            </p>
          </div>
        )}

        {/* ADD NOTE */}
        {!isTerminal && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Add Note
            </label>
            <Textarea
              placeholder="Enter internal note or update..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px] resize-none rounded-xl"
            />
            <Button
              variant="outline"
              className="w-full h-11 gap-2 rounded-full"
              onClick={() => {
                if (note.trim()) {
                  handleStatusUpdate(order.status, note);
                }
              }}
              disabled={!note.trim() || isUpdatingStatus}
            >
              <MessageSquare className="w-4 h-4" />
              Add Note
            </Button>
          </div>
        )}

        {/* CANCEL ORDER */}
        {canBeCancelled(order.status) && (
          <div className="pt-4 border-t border-slate-200">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 gap-2 text-red-600 border-red-200 hover:bg-red-50 rounded-full"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Cancel Order?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The order will be marked as
                    cancelled and customer analytics will be updated accordingly.
                    {order.paidAmount > 0 && (
                      <span className="block mt-2 text-orange-600">
                        Note: ₹{order.paidAmount.toFixed(2)} has been paid. You may need to process a refund.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">No, Keep Order</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelOrder}
                    className="bg-red-600 hover:bg-red-700 rounded-full"
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </motion.div>

      {/* Add Items Modal */}
      <AddItemsModal
        order={order}
        open={showAddItemsModal}
        onOpenChange={setShowAddItemsModal}
        onSuccess={handleAddItemsSuccess}
      />
    </>
  );
}