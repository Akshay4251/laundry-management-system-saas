//app/(dashboard)/orders/[id]/components/order-items-table.tsx
'use client';

import { useState } from 'react';
import { 
  OrderDetail, 
  OrderItemDetail,
  ITEM_STATUS_CONFIG,
  ItemStatus,
} from '@/app/types/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Package, 
  Factory, 
  MoreVertical,
  Loader2,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSendItemsToWorkshop } from '@/app/hooks/use-orders';
import { SendToWorkshopModal } from '@/components/workshop/send-to-workshop-modal';

interface OrderItemsTableProps {
  order: OrderDetail;
}

const WORKSHOP_ELIGIBLE_STATUSES: ItemStatus[] = ['RECEIVED', 'IN_PROGRESS', 'READY'];
const WORKSHOP_ALLOWED_ORDER_STATUSES = ['IN_PROGRESS', 'READY'];

function canItemBeSentToWorkshop(item: OrderItemDetail): boolean {
  if (item.sentToWorkshop) return false;
  return WORKSHOP_ELIGIBLE_STATUSES.includes(item.status);
}

function getStatusBadgeConfig(status: ItemStatus) {
  const config = ITEM_STATUS_CONFIG[status];
  
  if (!config) {
    return {
      label: status,
      className: 'bg-slate-100 text-slate-600 border-slate-200 rounded-full',
    };
  }

  return {
    label: config.label,
    className: cn(config.bgColor, config.color, 'border', config.borderColor, 'rounded-full'),
  };
}

export function OrderItemsTable({ order }: OrderItemsTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { mutate: sendToWorkshop, isPending: isSending } = useSendItemsToWorkshop();

  if (!order || !order.items) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Order Items</h3>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">No items in this order</p>
        </div>
      </div>
    );
  }

  const items = order.items;
  const canSendToWorkshop = WORKSHOP_ALLOWED_ORDER_STATUSES.includes(order.status);
  const workshopEligibleItems = items.filter(canItemBeSentToWorkshop);

  const handleSelectAll = () => {
    if (selectedItems.length === workshopEligibleItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(workshopEligibleItems.map((item) => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSendSelectedToWorkshop = (
    workshopPartnerName?: string,
    workshopNotes?: string
  ) => {
    if (selectedItems.length === 0) return;
    
    sendToWorkshop({
      orderId: order.id,
      itemIds: selectedItems,
      workshopPartnerName,
      workshopNotes,
    }, {
      onSuccess: () => setSelectedItems([]),
    });
  };

  const handleSendItemsFromModal = (
    itemIds: string[],
    partnerName?: string,
    notes?: string
  ) => {
    sendToWorkshop({
      orderId: order.id,
      itemIds,
      workshopPartnerName: partnerName,
      workshopNotes: notes,
    }, {
      onSuccess: () => setSelectedItems([]),
    });
  };

  const allSelected = selectedItems.length === workshopEligibleItems.length && workshopEligibleItems.length > 0;
  const someSelected = selectedItems.length > 0;
  const totalQuantity = order.stats?.totalQuantity || items.reduce((s, i) => s + i.quantity, 0);
  const workshopItemsCount = order.stats?.workshopItems || items.filter(i => i.sentToWorkshop).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Order Items</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''} • {totalQuantity} pieces
            {workshopItemsCount > 0 && (
              <span className="text-purple-600 ml-1">
                • {workshopItemsCount} at workshop
              </span>
            )}
          </p>
        </div>

        {canSendToWorkshop && workshopEligibleItems.length > 0 && (
          <div className="flex items-center gap-2">
            {someSelected ? (
              <SendToWorkshopModal
                items={items.filter((item) => selectedItems.includes(item.id))}
                onConfirm={(_, partnerName, notes) => 
                  handleSendSelectedToWorkshop(partnerName, notes)
                }
                isLoading={isSending}
                trigger={
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                    disabled={isSending}
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Factory className="w-4 h-4 mr-2" />
                    )}
                    Send {selectedItems.length} to Workshop
                  </Button>
                }
              />
            ) : (
              <SendToWorkshopModal
                items={items}
                onConfirm={handleSendItemsFromModal}
                isLoading={isSending}
              />
            )}
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              {canSendToWorkshop && workshopEligibleItems.length > 0 && (
                <TableHead className="w-12 pl-6">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all eligible items"
                    className="rounded-md"
                  />
                </TableHead>
              )}
              <TableHead className={cn(!canSendToWorkshop && "pl-6")}>Item</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Tag #</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isEligible = canItemBeSentToWorkshop(item);
              const isSelected = selectedItems.includes(item.id);
              const statusConfig = getStatusBadgeConfig(item.status);
              
              return (
                <TableRow 
                  key={item.id} 
                  className={cn(
                    "hover:bg-slate-50/50",
                    isSelected && "bg-purple-50/50",
                    item.sentToWorkshop && "bg-purple-50/30"
                  )}
                >
                  {canSendToWorkshop && workshopEligibleItems.length > 0 && (
                    <TableCell className="pl-6">
                      {isEligible ? (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectItem(item.id)}
                          aria-label={`Select ${item.itemName}`}
                          className="rounded-md"
                        />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </TableCell>
                  )}
                  
                  <TableCell className={cn(!canSendToWorkshop && "pl-6")}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {item.itemIcon ? (
                          <img 
                            src={item.itemIcon} 
                            alt={item.itemName}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-slate-900 truncate">{item.itemName}</p>
                          {item.isExpress && (
                            <Badge className="bg-orange-100 text-orange-700 border-0 text-[10px] px-2 py-0 rounded-full flex-shrink-0">
                              <Zap className="w-3 h-3 mr-0.5" />
                              Express
                            </Badge>
                          )}
                        </div>
                        {(item.color || item.brand) && (
                          <p className="text-xs text-slate-500 truncate">
                            {[item.color, item.brand].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="font-normal rounded-full">
                      {item.treatmentName || '-'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <code className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-mono">
                      {item.tagNumber}
                    </code>
                  </TableCell>
                  
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  
                  <TableCell>₹{item.subtotal.toFixed(2)}</TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                      {item.sentToWorkshop && (
                        <Factory className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="pr-6 text-right">
                    <ItemActionsMenu item={item} order={order} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {items.map((item) => {
          const isEligible = canItemBeSentToWorkshop(item);
          const isSelected = selectedItems.includes(item.id);
          const statusConfig = getStatusBadgeConfig(item.status);

          return (
            <div 
              key={item.id} 
              className={cn(
                "p-4",
                isSelected && "bg-purple-50/50",
                item.sentToWorkshop && "bg-purple-50/30"
              )}
            >
              <div className="flex items-start gap-3">
                {canSendToWorkshop && isEligible && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelectItem(item.id)}
                    className="mt-1 flex-shrink-0 rounded-md"
                  />
                )}
                
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {item.itemIcon ? (
                    <img 
                      src={item.itemIcon} 
                      alt={item.itemName}
                      className="w-7 h-7 object-contain"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-900 truncate">{item.itemName}</p>
                        {item.isExpress && (
                          <Badge className="bg-orange-100 text-orange-700 border-0 text-[10px] rounded-full flex-shrink-0">
                            Express
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{item.tagNumber}</p>
                    </div>
                    <ItemActionsMenu item={item} order={order} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {item.treatmentName && (
                      <Badge variant="outline" className="text-xs rounded-full">
                        {item.treatmentName}
                      </Badge>
                    )}
                    <Badge className={cn(statusConfig.className, "text-xs")}>
                      {statusConfig.label}
                    </Badge>
                    {item.sentToWorkshop && (
                      <Badge className="bg-purple-100 text-purple-700 border-0 text-xs rounded-full">
                        <Factory className="w-3 h-3 mr-1" />
                        Workshop
                      </Badge>
                    )}
                  </div>

                  {item.sentToWorkshop && item.workshopPartnerName && (
                    <p className="text-xs text-purple-600 mt-1.5">
                      At: {item.workshopPartnerName}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-slate-500">
                      Qty: {item.quantity}
                    </span>
                    <span className="font-medium text-slate-900">
                      ₹{item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">
            Total: {totalQuantity} pieces
          </span>
          <span className="text-lg font-semibold text-slate-900">
            ₹{order.totalAmount?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface ItemActionsMenuProps {
  item: OrderItemDetail;
  order: OrderDetail;
}

function ItemActionsMenu({ item, order }: ItemActionsMenuProps) {
  const { mutate: sendToWorkshop, isPending } = useSendItemsToWorkshop();

  const canSendToWorkshop = 
    WORKSHOP_ALLOWED_ORDER_STATUSES.includes(order?.status) && 
    canItemBeSentToWorkshop(item);

  const handleSendSingleItem = () => {
    sendToWorkshop({
      orderId: order.id,
      itemIds: [item.id],
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Item actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl">
        <DropdownMenuItem className="cursor-pointer rounded-lg">
          <ExternalLink className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        
        {canSendToWorkshop && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-purple-600 focus:text-purple-600 focus:bg-purple-50 rounded-lg"
              onClick={handleSendSingleItem}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Factory className="w-4 h-4 mr-2" />
              )}
              Send to Workshop
            </DropdownMenuItem>
          </>
        )}

        {item.sentToWorkshop && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2 text-xs">
              <p className="text-purple-600 font-medium flex items-center gap-1">
                <Factory className="w-3 h-3" />
                At Workshop
              </p>
              {item.workshopPartnerName && (
                <p className="text-slate-500 mt-0.5">{item.workshopPartnerName}</p>
              )}
              {item.workshopSentDate && (
                <p className="text-slate-400 mt-0.5">
                  Sent: {new Date(item.workshopSentDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}