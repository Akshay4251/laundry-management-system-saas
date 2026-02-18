// app/(dashboard)/orders/[id]/components/add-items-modal.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Minus,
  X,
  Loader2,
  Package,
  Check,
  Zap,
  ShoppingCart,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useItems } from '@/app/hooks/use-items';
import { useAddOrderItems } from '@/app/hooks/use-add-order-items';
import { ServiceIconDisplay } from '@/components/services/service-icon-display';
import { OrderDetail, CartOrderItem } from '@/app/types/order';
import { Item } from '@/app/types/item';

// ============================================================================
// TYPES
// ============================================================================

interface AddItemsModalProps {
  order: OrderDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDefaultDeliveryDate(isExpress: boolean): string {
  const date = new Date();
  date.setDate(date.getDate() + (isExpress ? 1 : 2));
  date.setHours(17, 0, 0, 0);
  return date.toISOString().slice(0, 16);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AddItemsModal({
  order,
  open,
  onOpenChange,
  onSuccess,
}: AddItemsModalProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartOrderItem[]>([]);
  const [isExpress, setIsExpress] = useState(order.priority === 'EXPRESS');
  
  // Delivery date state - only needed if order doesn't have one
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    if (order.deliveryDate) {
      return new Date(order.deliveryDate).toISOString().slice(0, 16);
    }
    return getDefaultDeliveryDate(order.priority === 'EXPRESS');
  });

  // Check if delivery date needs to be set
  const needsDeliveryDate = !order.deliveryDate;

  // Hooks
  const { items, services, isLoading: itemsLoading } = useItems({ activeOnly: true });
  const { mutateAsync: addItems, isPending: isAdding } = useAddOrderItems();

  const EXPRESS_MULTIPLIER = 1.5;

  // Auto-select first service
  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedServiceId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setCartItems([]);
      setSearchQuery('');
      setIsExpress(order.priority === 'EXPRESS');
      if (order.deliveryDate) {
        setDeliveryDate(new Date(order.deliveryDate).toISOString().slice(0, 16));
      } else {
        setDeliveryDate(getDefaultDeliveryDate(order.priority === 'EXPRESS'));
      }
    }
  }, [open, order.priority, order.deliveryDate]);

  // Update delivery date when Express mode changes (only if we need to set it)
  useEffect(() => {
    if (needsDeliveryDate) {
      setDeliveryDate(getDefaultDeliveryDate(isExpress));
    }
  }, [isExpress, needsDeliveryDate]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const activeService = services.find(t => t.id === selectedServiceId);

  const toggleItem = (item: Item) => {
    if (!selectedServiceId || !activeService) return;

    const priceEntry = item.prices?.find(p => p.serviceId === selectedServiceId);
    
    if (!priceEntry || !priceEntry.isAvailable) {
      toast.error(`${item.name} not available for ${activeService.name}`);
      return;
    }

    const cartKey = `${item.id}-${selectedServiceId}`;
    const existingIndex = cartItems.findIndex(ci => ci.cartKey === cartKey);

    if (existingIndex > -1) {
      setCartItems(cartItems.filter(ci => ci.cartKey !== cartKey));
    } else {
      setCartItems([
        ...cartItems,
        {
          cartKey,
          id: item.id,
          serviceId: selectedServiceId,
          name: item.name,
          serviceName: activeService.name,
          quantity: 1,
          price: priceEntry.price || 0,
          iconUrl: item.iconUrl,
        },
      ]);
    }
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter(ci => ci.cartKey !== cartKey));
    } else {
      setCartItems(
        cartItems.map(ci =>
          ci.cartKey === cartKey ? { ...ci, quantity } : ci
        )
      );
    }
  };

  const handleAddItems = async () => {
    if (cartItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    // Validate delivery date if it needs to be set
    if (needsDeliveryDate && !deliveryDate) {
      toast.error('Please set a delivery date');
      return;
    }

    try {
      await addItems({
        orderId: order.id,
        items: cartItems.map(item => ({
          itemId: item.id,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.price,
          expressPrice: isExpress ? Math.round(item.price * EXPRESS_MULTIPLIER) : null,
        })),
        isExpress,
        transitionToInProgress: order.status === 'PICKUP',
        deliveryDate: needsDeliveryDate ? new Date(deliveryDate).toISOString() : undefined,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => {
    const price = isExpress ? Math.round(item.price * EXPRESS_MULTIPLIER) : item.price;
    return sum + price * item.quantity;
  }, 0);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  Add Items to Order
                </DialogTitle>
                <DialogDescription>
                  Order #{order.orderNumber} • {order.customer?.fullName}
                </DialogDescription>
              </div>
            </div>

            {/* Express Toggle */}
            <button
              onClick={() => setIsExpress(!isExpress)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                isExpress
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Zap className={cn("w-4 h-4", isExpress && "animate-pulse")} />
              Express {isExpress ? 'ON' : 'OFF'}
            </button>
          </div>
        </DialogHeader>

        {/* Express Banner */}
        <AnimatePresence>
          {isExpress && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex-shrink-0"
            >
              <div className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center">
                <p className="text-sm font-medium flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Express Mode: 1.5x pricing • Priority processing
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delivery Date Section (Only if not set) */}
        {needsDeliveryDate && (
          <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex-shrink-0">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Set Delivery Date
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  This pickup order doesn't have a delivery date. Please set one before adding items.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Label className="text-sm font-medium text-amber-800 flex items-center gap-2 whitespace-nowrap">
                    <Calendar className="w-4 h-4" />
                    Expected Delivery:
                  </Label>
                  <Input
                    type="datetime-local"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="h-10 max-w-xs bg-white border-amber-300 focus:border-amber-500"
                  />
                  {isExpress && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      Express: Next Day
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Service Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {services.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedServiceId(t.id)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all",
                  selectedServiceId === t.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          {itemsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map((item) => {
                const priceEntry = item.prices?.find(p => p.serviceId === selectedServiceId);
                const isAvailable = priceEntry?.isAvailable ?? false;
                const cartKey = selectedServiceId ? `${item.id}-${selectedServiceId}` : '';
                const cartItem = cartItems.find(ci => ci.cartKey === cartKey);
                const isSelected = !!cartItem;
                const quantity = cartItem?.quantity || 0;
                const basePrice = priceEntry?.price || 0;
                const displayPrice = isExpress ? Math.round(basePrice * EXPRESS_MULTIPLIER) : basePrice;

                return (
                  <div
                    key={item.id}
                    onClick={() => isAvailable && !isSelected && toggleItem(item)}
                    className={cn(
                      'relative p-3 rounded-xl border-2 transition-all cursor-pointer',
                      !isAvailable && 'opacity-50 cursor-not-allowed bg-slate-50',
                      isAvailable && !isSelected && 'bg-white border-slate-200 hover:border-slate-300',
                      isSelected && 'bg-blue-50 border-blue-400'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className="flex flex-col items-center text-center">
                      <ServiceIconDisplay
                        iconUrl={item.iconUrl}
                        name={item.name}
                        size="lg"
                        showBackground
                      />
                      <p className="font-medium text-sm mt-2 truncate w-full">{item.name}</p>
                      {isAvailable ? (
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-xs font-semibold text-blue-600">₹{displayPrice}</p>
                          {isExpress && (
                            <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded">
                              +50%
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">N/A</p>
                      )}

                      {isSelected && (
                        <div
                          className="flex items-center gap-2 mt-2 bg-white rounded-full p-1 border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 rounded-full"
                            onClick={() => updateQuantity(cartKey, Math.max(0, quantity - 1))}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-5 text-center font-bold text-sm">{quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 rounded-full"
                            onClick={() => updateQuantity(cartKey, quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center justify-between w-full flex-wrap gap-3">
            {/* Cart Summary */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-slate-600">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-medium">{totalItems} items</span>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "text-sm font-bold",
                  isExpress ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                )}
              >
                ₹{subtotal.toFixed(0)}
              </Badge>
              {needsDeliveryDate && deliveryDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(deliveryDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isAdding}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddItems}
                disabled={cartItems.length === 0 || isAdding || (needsDeliveryDate && !deliveryDate)}
                className={cn(
                  "rounded-full min-w-[140px]",
                  isExpress
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add {totalItems} Items
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}