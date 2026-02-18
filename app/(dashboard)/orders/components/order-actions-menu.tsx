// app/(dashboard)/orders/components/order-actions-menu.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderItemDetail, ItemStatus } from '@/app/types/order';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  MoreVertical,
  Eye,
  Printer,
  Factory,
  Loader2,
  XCircle,
  Send,
  AlertCircle,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { useUpdateOrderStatus, useSendItemsToWorkshop } from '@/app/hooks/use-orders';
import { useBusinessFeatures } from '@/app/hooks/use-business-features';
import { ServiceIconDisplay } from '@/components/services/service-icon-display';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OrderActionsMenuProps {
  order: Order;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WORKSHOP_ELIGIBLE_STATUSES: ItemStatus[] = ['RECEIVED', 'IN_PROGRESS', 'READY'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function canItemBeSentToWorkshop(item: OrderItemDetail): boolean {
  if (item.sentToWorkshop === true) {
    return false;
  }
  return WORKSHOP_ELIGIBLE_STATUSES.includes(item.status);
}

function getStatusLabel(status: ItemStatus): string {
  const labels: Record<ItemStatus, string> = {
    'RECEIVED': 'Received',
    'IN_PROGRESS': 'In Progress',
    'AT_WORKSHOP': 'At Workshop',
    'WORKSHOP_RETURNED': 'Returned',
    'READY': 'Ready',
    'COMPLETED': 'Completed',
  };
  return labels[status] || status;
}

function getStatusColor(status: ItemStatus): string {
  const colors: Record<ItemStatus, string> = {
    'RECEIVED': 'bg-slate-100 text-slate-700',
    'IN_PROGRESS': 'bg-blue-100 text-blue-700',
    'AT_WORKSHOP': 'bg-purple-100 text-purple-700',
    'WORKSHOP_RETURNED': 'bg-violet-100 text-violet-700',
    'READY': 'bg-green-100 text-green-700',
    'COMPLETED': 'bg-emerald-100 text-emerald-700',
  };
  return colors[status] || 'bg-slate-100 text-slate-700';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OrderActionsMenu({ order }: OrderActionsMenuProps) {
  const router = useRouter();
  
  // Get business features
  const { workshopEnabled } = useBusinessFeatures();
  
  // Dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSendAllDialog, setShowSendAllDialog] = useState(false);
  const [showItemsDialog, setShowItemsDialog] = useState(false);
  
  // Data states
  const [orderItems, setOrderItems] = useState<OrderItemDetail[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Workshop form
  const [workshopPartnerName, setWorkshopPartnerName] = useState('');
  const [workshopNotes, setWorkshopNotes] = useState('');

  // Mutations
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus();
  const { mutate: sendToWorkshop, isPending: isSendingToWorkshop } = useSendItemsToWorkshop();

  // Only show workshop actions if enabled AND order is in eligible status
  const canSendToWorkshop = workshopEnabled && 
    (order.status === 'IN_PROGRESS' || order.status === 'READY');
  
  const canBeCancelled = [
    'PICKUP', 
    'IN_PROGRESS', 
    'AT_WORKSHOP', 
    'WORKSHOP_RETURNED', 
    'READY'
  ].includes(order.status);

  // Computed values
  const eligibleItems = orderItems.filter(canItemBeSentToWorkshop);
  const ineligibleItems = orderItems.filter(item => !canItemBeSentToWorkshop(item));

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const fetchOrderItems = async () => {
    setFetchingItems(true);
    setSelectedItems([]);
    setFetchError(null);
    
    try {
      const response = await fetch(`/api/orders/${order.id}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to fetch order details');
      }

      setOrderItems(result.data?.items || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load items';
      setFetchError(errorMsg);
      toast.error('Failed to load order items', { description: errorMsg });
      setOrderItems([]);
    } finally {
      setFetchingItems(false);
    }
  };

  const handleViewDetails = () => {
    router.push(`/orders/${order.id}`);
  };

  const handlePrintInvoice = () => {
    window.open(`/orders/${order.id}/print/invoice`, '_blank');
  };

  const handlePrintTags = () => {
    window.open(`/orders/${order.id}/print/tags`, '_blank');
  };

  const handleOpenItemsDialog = async () => {
    setShowItemsDialog(true);
    await fetchOrderItems();
  };

  const handleSelectAll = () => {
    if (selectedItems.length === eligibleItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(eligibleItems.map((item) => item.id));
    }
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSendItemsToWorkshop = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    sendToWorkshop(
      {
        orderId: order.id,
        itemIds: selectedItems,
        workshopPartnerName: workshopPartnerName.trim() || undefined,
        workshopNotes: workshopNotes.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          resetDialogState();
          toast.success(data.message || 'Items sent to workshop!');
        },
        onError: (error) => {
          toast.error('Failed to send items to workshop', {
            description: error.message,
          });
        },
      }
    );
  };

  const handleSendAllToWorkshop = () => {
    updateStatus(
      {
        id: order.id,
        status: 'AT_WORKSHOP',
        notes: 'Entire order sent to external workshop',
        workshopPartnerName: workshopPartnerName.trim() || 'External Workshop',
        workshopNotes: workshopNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowSendAllDialog(false);
          setWorkshopPartnerName('');
          setWorkshopNotes('');
          toast.success('Order sent to workshop!');
        },
        onError: (error) => {
          toast.error('Failed to send order to workshop', {
            description: error.message,
          });
        },
      }
    );
  };

  const handleCancelOrder = async () => {
    setCancellingOrder(true);
    
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel order');
      }

      setShowCancelDialog(false);
      toast.success('Order cancelled successfully');

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Failed to cancel order', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setCancellingOrder(false);
    }
  };

  const resetDialogState = () => {
    setShowItemsDialog(false);
    setSelectedItems([]);
    setWorkshopPartnerName('');
    setWorkshopNotes('');
    setOrderItems([]);
    setFetchError(null);
  };

  const allSelected = selectedItems.length === eligibleItems.length && eligibleItems.length > 0;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={handleViewDetails} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
            Print
          </DropdownMenuLabel>
          
          <DropdownMenuItem onClick={handlePrintInvoice} className="cursor-pointer">
            <Printer className="mr-2 h-4 w-4" />
            Invoice
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handlePrintTags} className="cursor-pointer">
            <Printer className="mr-2 h-4 w-4" />
            Item Tags
          </DropdownMenuItem>

          {/* Workshop Actions - Only if workshop is enabled */}
          {canSendToWorkshop && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-purple-600 font-semibold flex items-center gap-1">
                <Factory className="w-3 h-3" />
                {order.status === 'READY' ? 'Send Back to Workshop' : 'Workshop'}
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={handleOpenItemsDialog}
                className="cursor-pointer text-purple-600 focus:text-purple-600 focus:bg-purple-50"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Items to Workshop
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setShowSendAllDialog(true)}
                className="cursor-pointer text-purple-700 focus:text-purple-700 focus:bg-purple-100 font-medium"
              >
                <Factory className="mr-2 h-4 w-4" />
                Send Entire Order
              </DropdownMenuItem>
            </>
          )}

          {canBeCancelled && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowCancelDialog(true)}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Items Selection Dialog */}
      <Dialog open={showItemsDialog} onOpenChange={(open) => !open && resetDialogState()}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-slate-200">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Factory className="w-5 h-5 text-purple-600" />
              </div>
              Send Items to Workshop
            </DialogTitle>
            <DialogDescription>
              Select items to send to external workshop for specialized processing.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {fetchingItems ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="ml-3 text-slate-600">Loading items...</p>
              </div>
            ) : fetchError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed to load items</p>
                    <p className="text-xs text-red-700 mt-1">{fetchError}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={fetchOrderItems}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Workshop Partner Name */}
                <div className="space-y-2">
                  <Label htmlFor="partner-name" className="text-sm font-medium">
                    Workshop Partner Name
                  </Label>
                  <Input
                    id="partner-name"
                    placeholder="e.g. ABC Dry Cleaners"
                    value={workshopPartnerName}
                    onChange={(e) => setWorkshopPartnerName(e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* Workshop Notes */}
                <div className="space-y-2">
                  <Label htmlFor="workshop-notes" className="text-sm font-medium">
                    Special Instructions
                  </Label>
                  <Textarea
                    id="workshop-notes"
                    placeholder="Any special handling instructions..."
                    value={workshopNotes}
                    onChange={(e) => setWorkshopNotes(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                </div>

                {/* Items Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Select Items
                      <span className="text-slate-500 font-normal ml-2">
                        ({eligibleItems.length} of {orderItems.length} available)
                      </span>
                    </Label>
                    {eligibleItems.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        className="h-8 text-xs"
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </Button>
                    )}
                  </div>

                  {orderItems.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600">No items found</p>
                    </div>
                  ) : eligibleItems.length === 0 ? (
                    <div className="space-y-3">
                      <div className="text-center py-6 bg-amber-50 rounded-lg border border-dashed border-amber-200">
                        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-amber-700">No eligible items</p>
                        <p className="text-xs text-amber-600 mt-1">
                          All items are either at workshop or completed
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <p className="text-xs font-medium text-slate-600 mb-2">Item status:</p>
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                          {ineligibleItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-xs">
                              <Package className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-slate-700 truncate flex-1">{item.itemName}</span>
                              <Badge className={cn("text-[10px] px-1.5", getStatusColor(item.status))}>
                                {item.sentToWorkshop ? '@ Workshop' : getStatusLabel(item.status)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {orderItems.map((item) => {
                        const isEligible = canItemBeSentToWorkshop(item);
                        const isSelected = selectedItems.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => isEligible && handleToggleItem(item.id)}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                              !isEligible && 'opacity-50 cursor-not-allowed bg-slate-50',
                              isEligible && !isSelected && 'cursor-pointer border-slate-200 bg-white hover:border-slate-300',
                              isEligible && isSelected && 'cursor-pointer border-purple-500 bg-purple-50'
                            )}
                          >
                            {isEligible ? (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleItem(item.id)}
                                className="shrink-0"
                              />
                            ) : (
                              <div className="w-4 h-4 shrink-0" />
                            )}

                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              {item.itemIcon ? (
                                <ServiceIconDisplay
                                  iconUrl={item.itemIcon}
                                  name={item.itemName}
                                  size="sm"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-slate-900">{item.itemName}</p>
                                {item.serviceName && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.serviceName}
                                  </Badge>
                                )}
                                {item.isExpress && (
                                  <Badge className="text-xs bg-orange-100 text-orange-700 border-0">
                                    Express
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                                  {item.tagNumber}
                                </code>
                                <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                                <Badge className={cn("text-[10px] px-1.5", getStatusColor(item.status))}>
                                  {getStatusLabel(item.status)}
                                </Badge>
                                {item.sentToWorkshop && (
                                  <Badge className="text-[10px] px-1.5 bg-purple-100 text-purple-700">
                                    @ Workshop
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedItems.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-purple-900">
                        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <Button
              variant="outline"
              onClick={resetDialogState}
              disabled={isSendingToWorkshop}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendItemsToWorkshop}
              disabled={selectedItems.length === 0 || isSendingToWorkshop}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSendingToWorkshop ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Factory className="w-4 h-4 mr-2" />
                  Send to Workshop ({selectedItems.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send All Dialog */}
      <AlertDialog open={showSendAllDialog} onOpenChange={setShowSendAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-purple-600" />
              Send Entire Order to Workshop?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                This will send all items in order{' '}
                <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">
                  {order.orderNumber}
                </code>{' '}
                to the workshop.
              </p>
              
              <div className="space-y-2 pt-2">
                <Label className="text-sm font-medium">Workshop Partner</Label>
                <Input
                  placeholder="e.g. ABC Dry Cleaners"
                  value={workshopPartnerName}
                  onChange={(e) => setWorkshopPartnerName(e.target.value)}
                />
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 font-medium text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  Order status will change to "At Workshop"
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isUpdatingStatus}
              onClick={() => setWorkshopPartnerName('')}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendAllToWorkshop}
              disabled={isUpdatingStatus}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUpdatingStatus ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Factory className="w-4 h-4 mr-2" />
              )}
              Send All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Cancel Order?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel order {order.orderNumber}.
              {order.paidAmount > 0 && (
                <span className="block mt-2 text-orange-600 font-medium bg-orange-50 p-2 rounded">
                  ₹{order.paidAmount.toFixed(2)} has been paid - refund may be needed.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancellingOrder}>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={cancellingOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancellingOrder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}