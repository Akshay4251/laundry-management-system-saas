'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SendToWorkshopModal } from '@/components/workshop/send-to-workshop-modal';
import { OrderItem } from '@/app/types/order';
import { Shirt, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// 1. THIS INTERFACE FIXES THE ERROR
interface OrderItemsTableProps {
  items: OrderItem[];
  onStatusUpdate: (itemIds: string[], status: string) => Promise<void>;
}

export function OrderItemsTable({ items, onStatusUpdate }: OrderItemsTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Flow A: Mark items as Ready (In-Store)
  const handleMarkReady = async () => {
    setIsUpdating(true);
    await onStatusUpdate(selectedItems, 'ready');
    setSelectedItems([]);
    setIsUpdating(false);
  };

  // Flow B: Send items to Workshop
  const handleSendToWorkshop = async () => {
    setIsUpdating(true);
    await onStatusUpdate(selectedItems, 'workshop');
    setSelectedItems([]);
    setIsUpdating(false);
  };

  return (
    <div className="space-y-4">
      {/* Bulk Action Toolbar - Appears when items are checked */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
             <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {selectedItems.length}
             </span>
             <span className="text-sm font-medium text-blue-900">items selected</span>
          </div>
          
          <div className="flex gap-2">
            {/* FLOW A BUTTON */}
            <Button 
                size="sm" 
                disabled={isUpdating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
                onClick={handleMarkReady}
            >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Ready
            </Button>

            {/* FLOW B BUTTON (MODAL) */}
            <SendToWorkshopModal 
                count={selectedItems.length}
                onConfirm={handleSendToWorkshop}
            />
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="w-12 px-4 py-3">
                {/* Header Checkbox could go here for 'Select All' */}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Details</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
               // Logic: Can only select items that are New, Received, or Processing
               // Cannot select items already at workshop, ready, or delivered
               const isActionable = ['received', 'processing'].includes(item.status);

               return (
                <tr key={item.id} className={cn("transition-colors", isActionable ? "hover:bg-slate-50/50" : "bg-slate-50/30")}>
                  <td className="px-4 py-3">
                    <Checkbox 
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleSelection(item.id)}
                        disabled={!isActionable || isUpdating}
                        className={cn(
                          "border-slate-300 data-[state=checked]:bg-blue-600",
                          !isActionable && "opacity-50"
                        )}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                            <Shirt className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900">{item.itemType}</p>
                            <p className="text-xs text-slate-500 font-mono">{item.tagNumber}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                     <div className="flex gap-1 flex-wrap">
                        {item.services.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium uppercase tracking-wide border border-slate-200">
                                {s.replace('_', ' ')}
                            </span>
                        ))}
                     </div>
                  </td>
                  <td className="px-4 py-3">
                     <ItemStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    ₹{item.price}
                  </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper Component for Status Badges
function ItemStatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'workshop':
            return (
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border border-orange-100 gap-1.5 pl-1.5 pr-2.5">
                    <Truck className="w-3 h-3" /> At Workshop
                </Badge>
            );
        case 'ready':
            return (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-100 gap-1.5 pl-1.5 pr-2.5">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                </Badge>
            );
        case 'processing':
            return (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100">
                    Processing
                </Badge>
            );
        case 'delivered':
            return (
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                    Delivered
                </Badge>
            );
        default:
            return <Badge variant="outline" className="text-slate-500 capitalize">{status}</Badge>;
    }
}