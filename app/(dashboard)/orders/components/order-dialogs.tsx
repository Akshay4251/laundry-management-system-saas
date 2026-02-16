// app/(dashboard)/orders/components/order-dialogs.tsx
// Fix the ConfirmDialogState interface

'use client';

import { Loader2, AlertTriangle, Factory, AlertCircle, Package, CheckCircle2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { OrderItemDetail, ItemStatus, OrderStatus } from '@/app/types/order'; // Added OrderStatus
import { ServiceIconDisplay } from '@/components/services/service-icon-display';

// Fixed: Use OrderStatus type instead of string
export interface ConfirmDialogState {
  open: boolean;
  orderId: string;
  orderNumber: string;
  action: 'cancel' | 'status';
  targetStatus?: OrderStatus; // Fixed: Use OrderStatus
  message?: string;
}

export interface WorkshopDialogState {
  open: boolean;
  orderId: string;
  orderNumber: string;
}

interface OrderDialogsProps {
  confirmDialog: ConfirmDialogState;
  sendAllDialog: WorkshopDialogState;
  selectItemsDialog: WorkshopDialogState;
  workshopPartnerName: string;
  workshopNotes: string;
  onConfirmDialogChange: (state: ConfirmDialogState) => void;
  onSendAllDialogChange: (state: WorkshopDialogState) => void;
  onSelectItemsDialogChange: (state: WorkshopDialogState) => void;
  onWorkshopPartnerNameChange: (value: string) => void;
  onWorkshopNotesChange: (value: string) => void;
  onConfirmAction: () => void;
  onConfirmSendAll: () => void;
  onConfirmSelectItems: () => void;
  isUpdating: boolean;
  isCancelling: boolean;
  isSendingToWorkshop: boolean;
  orderItems: OrderItemDetail[];
  selectedItems: string[];
  onToggleItem: (itemId: string) => void;
  onSelectAll: () => void;
  fetchingItems: boolean;
  fetchError: string | null;
}

const WORKSHOP_ELIGIBLE_STATUSES: ItemStatus[] = ['RECEIVED', 'IN_PROGRESS', 'READY'];

function canItemBeSentToWorkshop(item: OrderItemDetail): boolean {
  if (item.sentToWorkshop === true) return false;
  return WORKSHOP_ELIGIBLE_STATUSES.includes(item.status);
}

function getStatusLabel(status: ItemStatus): string {
  const labels: Record<ItemStatus, string> = {
    RECEIVED: 'Received',
    IN_PROGRESS: 'In Progress',
    AT_WORKSHOP: 'At Workshop',
    WORKSHOP_RETURNED: 'Returned',
    READY: 'Ready',
    COMPLETED: 'Completed',
  };
  return labels[status] || status;
}

function getStatusColor(status: ItemStatus): string {
  const colors: Record<ItemStatus, string> = {
    RECEIVED: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    AT_WORKSHOP: 'bg-purple-100 text-purple-700',
    WORKSHOP_RETURNED: 'bg-violet-100 text-violet-700',
    READY: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
  };
  return colors[status] || 'bg-slate-100 text-slate-700';
}

export function OrderDialogs({
  confirmDialog,
  sendAllDialog,
  selectItemsDialog,
  workshopPartnerName,
  workshopNotes,
  onConfirmDialogChange,
  onSendAllDialogChange,
  onSelectItemsDialogChange,
  onWorkshopPartnerNameChange,
  onWorkshopNotesChange,
  onConfirmAction,
  onConfirmSendAll,
  onConfirmSelectItems,
  isUpdating,
  isCancelling,
  isSendingToWorkshop,
  orderItems,
  selectedItems,
  onToggleItem,
  onSelectAll,
  fetchingItems,
  fetchError,
}: OrderDialogsProps) {
  const eligibleItems = orderItems.filter(canItemBeSentToWorkshop);
  const allSelected = selectedItems.length === eligibleItems.length && eligibleItems.length > 0;

  return (
    <>
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => onConfirmDialogChange({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog.action === 'cancel' ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Cancel Order?
                </>
              ) : (
                'Confirm Action'
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmAction}
              className={confirmDialog.action === 'cancel' ? 'bg-red-600 hover:bg-red-700' : ''}
              disabled={isUpdating || isCancelling}
            >
              {(isUpdating || isCancelling) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {confirmDialog.action === 'cancel' ? 'Yes, Cancel Order' : 'Yes, Proceed'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={sendAllDialog.open} onOpenChange={(open) => !open && onSendAllDialogChange({ open: false, orderId: '', orderNumber: '' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-purple-600" />
              Send Entire Order to Workshop
            </DialogTitle>
            <DialogDescription>
              Send all items in order <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{sendAllDialog.orderNumber}</code> to external workshop.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partner-name-all">Workshop Partner</Label>
              <Input id="partner-name-all" placeholder="e.g., ABC Dry Cleaners" value={workshopPartnerName} onChange={(e) => onWorkshopPartnerNameChange(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes-all">Special Instructions</Label>
              <Textarea id="notes-all" placeholder="Any special handling instructions..." value={workshopNotes} onChange={(e) => onWorkshopNotesChange(e.target.value)} className="min-h-[80px]" />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-amber-800 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                Order status will change to "At Workshop"
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onSendAllDialogChange({ open: false, orderId: '', orderNumber: '' })}>Cancel</Button>
            <Button onClick={onConfirmSendAll} disabled={isUpdating} className="bg-purple-600 hover:bg-purple-700">
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Factory className="w-4 h-4 mr-2" />}
              Send All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={selectItemsDialog.open} onOpenChange={(open) => !open && onSelectItemsDialogChange({ open: false, orderId: '', orderNumber: '' })}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-slate-200">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Factory className="w-5 h-5 text-purple-600" />
              </div>
              Send Items to Workshop
            </DialogTitle>
            <DialogDescription>
              Order: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{selectItemsDialog.orderNumber}</code>
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
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed to load items</p>
                    <p className="text-xs text-red-700 mt-1">{fetchError}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Workshop Partner Name</Label>
                  <Input placeholder="e.g. ABC Dry Cleaners" value={workshopPartnerName} onChange={(e) => onWorkshopPartnerNameChange(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Textarea placeholder="Any special handling instructions..." value={workshopNotes} onChange={(e) => onWorkshopNotesChange(e.target.value)} className="min-h-[60px] resize-none" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>
                      Select Items
                      <span className="text-slate-500 font-normal ml-2">({eligibleItems.length} of {orderItems.length} available)</span>
                    </Label>
                    {eligibleItems.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-8 text-xs">
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
                    <div className="text-center py-6 bg-amber-50 rounded-lg border border-dashed border-amber-200">
                      <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-amber-700">No eligible items</p>
                      <p className="text-xs text-amber-600 mt-1">All items are at workshop or completed</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {orderItems.map((item) => {
                        const isEligible = canItemBeSentToWorkshop(item);
                        const isSelected = selectedItems.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => isEligible && onToggleItem(item.id)}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                              !isEligible && 'opacity-50 cursor-not-allowed bg-slate-50',
                              isEligible && !isSelected && 'cursor-pointer border-slate-200 bg-white hover:border-slate-300',
                              isEligible && isSelected && 'cursor-pointer border-purple-500 bg-purple-50'
                            )}
                          >
                            {isEligible ? (
                              <Checkbox checked={isSelected} onCheckedChange={() => onToggleItem(item.id)} className="shrink-0" />
                            ) : (
                              <div className="w-4 h-4 shrink-0" />
                            )}

                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              {item.itemIcon ? (
                                <ServiceIconDisplay iconUrl={item.itemIcon} name={item.itemName} size="sm" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-slate-900">{item.itemName}</p>
                                {item.treatmentName && <Badge variant="outline" className="text-xs">{item.treatmentName}</Badge>}
                              </div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">{item.tagNumber}</code>
                                <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                                <Badge className={cn('text-[10px] px-1.5', getStatusColor(item.status))}>{getStatusLabel(item.status)}</Badge>
                              </div>
                            </div>

                            {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedItems.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-purple-900">{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <Button variant="outline" onClick={() => onSelectItemsDialogChange({ open: false, orderId: '', orderNumber: '' })} disabled={isSendingToWorkshop}>Cancel</Button>
            <Button onClick={onConfirmSelectItems} disabled={selectedItems.length === 0 || isSendingToWorkshop} className="bg-purple-600 hover:bg-purple-700 text-white">
              {isSendingToWorkshop ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...
                </>
              ) : (
                <>
                  <Factory className="w-4 h-4 mr-2" />Send to Workshop ({selectedItems.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}