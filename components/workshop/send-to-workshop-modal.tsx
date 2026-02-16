// app/components/workshop/send-to-workshop-modal.tsx

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Factory,
  Loader2,
  AlertCircle,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderItemDetail, ItemStatus } from '@/app/types/order';
import { ServiceIconDisplay } from '@/components/services/service-icon-display';

interface SendToWorkshopModalProps {
  items: OrderItemDetail[];
  onConfirm: (itemIds: string[], workshopPartnerName?: string, workshopNotes?: string) => void;
  isLoading?: boolean;
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
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

export function SendToWorkshopModal({
  items,
  onConfirm,
  isLoading = false,
  trigger,
  defaultOpen = false,
}: SendToWorkshopModalProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [workshopPartnerName, setWorkshopPartnerName] = useState('');
  const [workshopNotes, setWorkshopNotes] = useState('');

  const eligibleItems = items.filter(canItemBeSentToWorkshop);
  const ineligibleItems = items.filter(item => !canItemBeSentToWorkshop(item));

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedItems([]);
      setWorkshopPartnerName('');
      setWorkshopNotes('');
    }
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

  const handleSubmit = () => {
    if (selectedItems.length === 0) return;

    onConfirm(
      selectedItems,
      workshopPartnerName.trim() || undefined,
      workshopNotes.trim() || undefined
    );

    handleOpenChange(false);
  };

  const allSelected = selectedItems.length === eligibleItems.length && eligibleItems.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      {!trigger && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            <Factory className="w-4 h-4" />
            Send to Workshop
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-200">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Factory className="w-5 h-5 text-purple-600" />
            </div>
            Send Items to Workshop
          </DialogTitle>
          <DialogDescription>
            Select items to send to external workshop partner for specialized processing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Workshop Partner Name */}
          <div className="space-y-2">
            <Label htmlFor="partner-name" className="text-sm font-medium">
              Workshop Partner Name
            </Label>
            <Input
              id="partner-name"
              placeholder="e.g. ABC Dry Cleaners, Premium Laundry Service"
              value={workshopPartnerName}
              onChange={(e) => setWorkshopPartnerName(e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-slate-500">
              Optional: Enter the name of the external workshop
            </p>
          </div>

          {/* Workshop Notes */}
          <div className="space-y-2">
            <Label htmlFor="workshop-notes" className="text-sm font-medium">
              Special Instructions
            </Label>
            <Textarea
              id="workshop-notes"
              placeholder="e.g. Handle with care, Remove stubborn stains, Express processing needed"
              value={workshopNotes}
              onChange={(e) => setWorkshopNotes(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Items Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Select Items to Send
                <span className="text-slate-500 font-normal ml-2">
                  ({eligibleItems.length} of {items.length} available)
                </span>
              </Label>
              {eligibleItems.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8 text-xs"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">No items found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Could not load order items
                </p>
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
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    Item status breakdown:
                  </p>
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                    {ineligibleItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-xs">
                        <Package className="w-3 h-3 text-slate-400 flex-shrink-0" />
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
                {eligibleItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItem(item.id)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer',
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className="flex-shrink-0"
                      />

                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
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
                          {item.treatmentName && (
                            <Badge variant="outline" className="text-xs">
                              {item.treatmentName}
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
                          <span className="text-xs text-slate-500">
                            Qty: {item.quantity}
                          </span>
                          <Badge className={cn("text-[10px] px-1.5", getStatusColor(item.status))}>
                            {getStatusLabel(item.status)}
                          </Badge>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}

                {ineligibleItems.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">
                      {ineligibleItems.length} item(s) cannot be sent:
                    </p>
                    <div className="space-y-1">
                      {ineligibleItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded bg-slate-50 opacity-60"
                        >
                          <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <Package className="w-3 h-3 text-slate-400" />
                          </div>
                          <span className="text-xs text-slate-600 flex-1 truncate">
                            {item.itemName}
                          </span>
                          <Badge className={cn("text-[10px] px-1.5", 
                            item.sentToWorkshop ? "bg-purple-100 text-purple-700" : getStatusColor(item.status)
                          )}>
                            {item.sentToWorkshop ? '@ Workshop' : getStatusLabel(item.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedItems.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-900">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-purple-700 mt-0.5">
                  These items will be marked as sent to workshop
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedItems.length === 0 || isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
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
  );
}