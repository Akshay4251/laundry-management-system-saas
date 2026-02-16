// app/(dashboard)/create-order/page.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, Minus, X, ShoppingBag, ChevronRight, Loader2, Check,
  Truck, CalendarClock, Package, AlertCircle, Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OrderSummaryPanel } from '@/components/dashboard/order-summary-panel';
import { OrderReviewModal } from '@/components/dashboard/order-review-modal';
import { CartOrderItem } from '@/app/types/order';
import { Customer } from '@/app/types/customer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useItems } from '@/app/hooks/use-items';
import { useAppContext } from '@/app/contexts/app-context';
import { useBusinessFeatures } from '@/app/hooks/use-business-features';
import { ServiceIconDisplay } from '@/components/services/service-icon-display';
import { Item } from '@/app/types/item';

// ============================================================================
// CATEGORIES
// ============================================================================

const categories = [
  { id: 'GARMENT', name: 'Garments', description: 'Shirts, Pants, Dresses' },
  { id: 'HOUSEHOLD', name: 'Household', description: 'Bedsheets, Curtains' },
  { id: 'SPECIALTY', name: 'Specialty', description: 'Premium Items' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDefaultPickupDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  return tomorrow.toISOString().slice(0, 16);
}

function getDefaultDeliveryDate(pickupDateStr?: string): string {
  const baseDate = pickupDateStr ? new Date(pickupDateStr) : new Date();
  const deliveryDate = new Date(baseDate);
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  deliveryDate.setHours(17, 0, 0, 0);
  return deliveryDate.toISOString().slice(0, 16);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreateOrderPage() {
  const router = useRouter();
  const { selectedStoreId, isLoading: storeLoading } = useAppContext();
  const { pickupEnabled, isLoading: featuresLoading } = useBusinessFeatures();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<CartOrderItem[]>([]);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Pickup scheduling modal state
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState(getDefaultPickupDate);
  const [deliveryDate, setDeliveryDate] = useState(() => getDefaultDeliveryDate());
  const [pickupNotes, setPickupNotes] = useState('');
  const [estimatedItems, setEstimatedItems] = useState('');
  const [isCreatingPickup, setIsCreatingPickup] = useState(false);

  // Fetch items
  const { items, treatments, isLoading: servicesLoading, isError } = useItems({
    activeOnly: true,
  });

  // Auto-select first treatment
  useEffect(() => {
    if (treatments.length > 0 && !selectedTreatmentId) {
      setSelectedTreatmentId(treatments[0].id);
    }
  }, [treatments, selectedTreatmentId]);

  // Auto-calculate delivery date when pickup date changes
  useEffect(() => {
    if (pickupDate) {
      setDeliveryDate(getDefaultDeliveryDate(pickupDate));
    }
  }, [pickupDate]);

  // Reset pickup modal state when it opens
  useEffect(() => {
    if (pickupModalOpen) {
      setPickupDate(getDefaultPickupDate());
      setDeliveryDate(getDefaultDeliveryDate());
      setPickupNotes('');
      setEstimatedItems('');
    }
  }, [pickupModalOpen]);

  const activeTreatment = treatments.find(t => t.id === selectedTreatmentId);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleItem = (item: Item) => {
    if (!selectedTreatmentId || !activeTreatment) return;

    const priceEntry = item.prices?.find(p => p.treatmentId === selectedTreatmentId);
    
    if (!priceEntry || !priceEntry.isAvailable) {
      toast.error(`${item.name} not available for ${activeTreatment.name}`);
      return;
    }

    const cartKey = `${item.id}-${selectedTreatmentId}`;
    const existingIndex = orderItems.findIndex(oi => oi.cartKey === cartKey);

    if (existingIndex > -1) {
      setOrderItems(orderItems.filter(oi => oi.cartKey !== cartKey));
    } else {
      const unitPrice = priceEntry.price || 0;

      setOrderItems([
        ...orderItems,
        {
          cartKey,
          id: item.id,
          treatmentId: selectedTreatmentId,
          name: item.name,
          treatmentName: activeTreatment.name,
          quantity: 1,
          price: unitPrice,
          iconUrl: item.iconUrl,
        },
      ]);
    }
  };

  const updateItemQuantity = (cartKey: string, quantity: number) => {
    if (quantity === 0) {
      setOrderItems(orderItems.filter((oi) => oi.cartKey !== cartKey));
    } else {
      setOrderItems(
        orderItems.map((oi) =>
          oi.cartKey === cartKey ? { ...oi, quantity } : oi
        )
      );
    }
  };

  const handleReviewOrder = () => {
    if (orderItems.length === 0) {
      toast.error('Please add items to the order');
      return;
    }
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }
    setReviewModalOpen(true);
    setMobileSheetOpen(false);
  };

  // ============================================================================
  // PICKUP SCHEDULING (Without Items)
  // ============================================================================

  const handleOpenPickupModal = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }
    setPickupModalOpen(true);
  };

  const handleSchedulePickup = async () => {
    if (!selectedCustomer || !selectedStoreId) {
      toast.error('Missing customer or store');
      return;
    }

    if (!pickupDate) {
      toast.error('Please select a pickup date');
      return;
    }

    if (!deliveryDate) {
      toast.error('Please select an expected delivery date');
      return;
    }

    const pickupDateTime = new Date(pickupDate);
    const deliveryDateTime = new Date(deliveryDate);
    
    if (deliveryDateTime <= pickupDateTime) {
      toast.error('Delivery date must be after pickup date');
      return;
    }

    setIsCreatingPickup(true);

    try {
      const orderData = {
        storeId: selectedStoreId,
        customerId: selectedCustomer.id,
        orderType: 'PICKUP',
        isExpress: false,
        items: [],
        pickupDate: pickupDateTime.toISOString(),
        deliveryDate: deliveryDateTime.toISOString(),
        notes: pickupNotes || undefined,
        estimatedItems: estimatedItems || undefined,
        paidAmount: 0,
        total: 0,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule pickup');
      }

      const data = await response.json();

      toast.success('📦 Pickup scheduled!', {
        description: `Order ${data.data.orderNumber} - Pickup: ${pickupDateTime.toLocaleDateString()}, Delivery: ${deliveryDateTime.toLocaleDateString()}`,
        duration: 5000,
      });

      setPickupModalOpen(false);
      setSelectedCustomer(null);

      router.push(`/orders/${data.data.id}`);
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      toast.error('Failed to schedule pickup', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsCreatingPickup(false);
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const clearSearch = () => setSearchQuery('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const getItemsByCategory = (categoryId: string) => {
    return filteredItems.filter((item) => item.category === categoryId);
  };

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ============================================================================
  // LOADING STATES
  // ============================================================================

  if (storeLoading || featuresLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!selectedStoreId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Please select a store</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Main Content Area */}
        <div className="flex-1 p-4 pt-4 sm:pt-6 lg:p-6 lg:pt-6 pb-28 lg:pb-6">
          {/* HEADER */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Order</h1>
              <p className="text-sm text-slate-500">
                {pickupEnabled 
                  ? 'Create walk-in order or schedule a pickup'
                  : 'Search items, select treatment, and add to cart'
                }
              </p>
            </div>

            {/* PICKUP BUTTON */}
            {pickupEnabled && (
              <Button
                onClick={handleOpenPickupModal}
                variant="outline"
                className={cn(
                  "gap-2 rounded-full border-2 transition-all",
                  selectedCustomer
                    ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    : "border-slate-200 text-slate-400"
                )}
                disabled={!selectedCustomer}
              >
                <Truck className="w-4 h-4" />
                Schedule Pickup
              </Button>
            )}
          </motion.div>

          {/* SEARCH BAR */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="mb-4"
          >
            <div className="relative">
              <div className={cn(
                'flex items-center h-12 rounded-full border transition-all duration-200',
                searchQuery 
                  ? 'border-blue-400 bg-white shadow-lg ring-4 ring-blue-50' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}>
                <Search className={cn(
                  'w-5 h-5 ml-5 transition-colors',
                  searchQuery ? 'text-blue-500' : 'text-slate-400'
                )} />
                <Input
                  type="text"
                  placeholder="Search for items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent h-full text-sm px-3 min-w-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {searchQuery && (
                  <motion.button
                    onClick={clearSearch}
                    className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* TREATMENT TABS */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
            {treatments.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTreatmentId(t.id)}
                className={cn(
                  "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all",
                  selectedTreatmentId === t.id
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>

          {servicesLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading items...</p>
            </div>
          )}

          {/* CATEGORIES ACCORDION */}
          {!servicesLoading && !isError && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }}
            >
              <Accordion 
                type="multiple" 
                defaultValue={['GARMENT', 'HOUSEHOLD', 'SPECIALTY']} 
                className="space-y-3"
              >
                {categories.map((category) => {
                  const categoryItems = getItemsByCategory(category.id);
                  if (categoryItems.length === 0 && !searchQuery) return null;

                  return (
                    <AccordionItem key={category.id} value={category.id} className="border-0">
                      <AccordionTrigger className="px-4 py-4 bg-white border border-slate-200 rounded-2xl hover:no-underline hover:bg-slate-50/50 hover:border-slate-300 transition-all data-[state=open]:rounded-b-none data-[state=open]:border-b-0 group">
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <span className="text-sm font-semibold text-slate-800 block">
                              {category.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {categoryItems.length} items available
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="bg-white border border-t-0 border-slate-200 rounded-b-2xl px-4 pb-4 pt-2">
                        {categoryItems.length > 0 ? (
                          <ServiceGrid
                            items={categoryItems}
                            orderItems={orderItems}
                            selectedTreatmentId={selectedTreatmentId}
                            onToggleItem={toggleItem}
                            onUpdateQuantity={updateItemQuantity}
                          />
                        ) : (
                          <div className="text-center py-8 text-sm text-slate-500">
                            No items found
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </motion.div>
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] w-[380px] shrink-0 p-6 pt-6 pl-0">
          <div className="h-full bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <OrderSummaryPanel
              items={orderItems}
              onUpdateQuantity={updateItemQuantity}
              onReviewOrder={handleReviewOrder}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 z-50">
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              className={cn(
                'w-full h-14 rounded-full text-base font-semibold transition-all relative overflow-hidden',
                orderItems.length === 0 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
              )} 
              disabled={orderItems.length === 0}
            >
              {orderItems.length === 0 ? (
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> No items selected
                </span>
              ) : (
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-normal opacity-90">
                        {totalItems} items
                      </span>
                      <span className="block font-bold">View Cart</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">₹{totalPrice.toFixed(0)}</span>
                    <ChevronRight className="w-5 h-5 opacity-70" />
                  </div>
                </div>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-3xl">
            <SheetHeader className="sr-only">
              <SheetTitle>Order Summary</SheetTitle>
              <SheetDescription>Review your cart</SheetDescription>
            </SheetHeader>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
            <OrderSummaryPanel
              items={orderItems}
              onUpdateQuantity={updateItemQuantity}
              onReviewOrder={handleReviewOrder}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Review Modal */}
      <OrderReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        items={orderItems}
        customer={selectedCustomer}
        storeId={selectedStoreId}
        onUpdateQuantity={updateItemQuantity}
        onSuccess={() => {
          setOrderItems([]);
          setSelectedCustomer(null);
        }}
      />

      {/* ============================================================================
          PICKUP SCHEDULING MODAL - SCROLLABLE
          ============================================================================ */}
      <Dialog open={pickupModalOpen} onOpenChange={setPickupModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col rounded-2xl p-0 gap-0 overflow-hidden">
          {/* STICKY HEADER */}
          <DialogHeader className="flex-shrink-0 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Schedule Pickup
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Create pickup order - add items after pickup
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 space-y-4">
              {/* Customer Info */}
              {selectedCustomer && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {selectedCustomer.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedCustomer.fullName}
                      </p>
                      <p className="text-sm text-slate-500">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  {selectedCustomer.address && (
                    <p className="text-xs text-slate-500 mt-2 pl-13">
                      📍 {selectedCustomer.address}
                    </p>
                  )}
                </div>
              )}

              {/* Pickup Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-amber-600" />
                  Pickup Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="h-11 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
                <p className="text-xs text-slate-500">
                  When to pickup from customer
                </p>
              </div>

              {/* Expected Delivery Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Expected Delivery Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={pickupDate}
                  className="h-11 border-green-200 focus:border-green-400 focus:ring-green-400"
                />
                <p className="text-xs text-slate-500">
                  When should the order be ready for customer
                </p>
              </div>

              {/* Estimated Items */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-500" />
                  Estimated Items (Optional)
                </Label>
                <Input
                  placeholder="e.g., 5 shirts, 3 pants, bedsheet"
                  value={estimatedItems}
                  onChange={(e) => setEstimatedItems(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-slate-500">
                  Help delivery person know what to expect
                </p>
              </div>

              {/* Pickup Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Pickup Instructions (Optional)
                </Label>
                <Textarea
                  placeholder="e.g., Ring doorbell twice, leave with guard, call before arriving..."
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  className="h-20 resize-none"
                />
              </div>

              {/* Info Box - Order Timeline */}
              <div className="bg-gradient-to-r from-amber-50 to-green-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Order Timeline
                    </p>
                    <div className="text-xs text-amber-700 mt-2 space-y-1">
                      <p className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <strong>Pickup:</strong> {pickupDate ? new Date(pickupDate).toLocaleString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Not set'}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <strong>Delivery:</strong> {deliveryDate ? new Date(deliveryDate).toLocaleString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info - What happens next */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">What happens next?</p>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                    Pickup order will be created with &quot;Pending Pickup&quot; status
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                    Assign delivery person to pick up items from customer
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                    Add actual items after pickup is completed
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
                    Process order and deliver by expected date
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* STICKY FOOTER */}
          <DialogFooter className="flex-shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setPickupModalOpen(false)}
              disabled={isCreatingPickup}
              className="rounded-full flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedulePickup}
              disabled={isCreatingPickup || !pickupDate || !deliveryDate}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 flex-1 sm:flex-none"
            >
              {isCreatingPickup ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Schedule Pickup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================================
// SERVICE GRID COMPONENT
// ============================================================================

interface ServiceGridProps {
  items: Item[];
  orderItems: CartOrderItem[];
  selectedTreatmentId: string | null;
  onToggleItem: (item: Item) => void;
  onUpdateQuantity: (cartKey: string, quantity: number) => void;
}

function ServiceGrid({ 
  items, 
  orderItems, 
  selectedTreatmentId, 
  onToggleItem, 
  onUpdateQuantity 
}: ServiceGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => {
          const priceEntry = item.prices?.find(p => p.treatmentId === selectedTreatmentId);
          const isAvailable = priceEntry?.isAvailable ?? false;
          
          const cartKey = selectedTreatmentId ? `${item.id}-${selectedTreatmentId}` : '';
          const cartItem = orderItems.find(oi => oi.cartKey === cartKey);
          const isSelected = !!cartItem;
          const quantity = cartItem?.quantity || 0;
          const displayPrice = priceEntry?.price || 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, delay: index * 0.02 }}
              layout
            >
              <div
                onClick={() => isAvailable && !isSelected && onToggleItem(item)}
                className={cn(
                  'relative p-4 rounded-2xl border-2 transition-all duration-200 select-none flex flex-col items-center text-center h-full',
                  !isAvailable && 'opacity-50 grayscale bg-slate-50 cursor-not-allowed border-slate-100',
                  isAvailable && !isSelected && 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm cursor-pointer active:scale-[0.98]',
                  isSelected && 'bg-blue-50 border-blue-400 shadow-md shadow-blue-100'
                )}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 z-10"
                    >
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-600/30">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mb-3 transition-transform duration-200 flex-1 flex flex-col justify-center">
                  <ServiceIconDisplay 
                    iconUrl={item.iconUrl} 
                    name={item.name} 
                    size="xl" 
                    showBackground={true} 
                  />
                </div>

                <div className="w-full">
                  <p 
                    className={cn(
                      'font-medium text-sm mb-1 truncate w-full',
                      isSelected ? 'text-slate-900' : 'text-slate-700'
                    )} 
                    title={item.name}
                  >
                    {item.name}
                  </p>
                  
                  {isAvailable ? (
                    <p className={cn(
                      'text-xs font-semibold',
                      isSelected ? 'text-blue-600' : 'text-slate-500'
                    )}>
                      ₹{displayPrice}
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-slate-400">N/A</p>
                  )}

                  {/* Quantity Controls */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="mt-3 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2 bg-white rounded-full p-1 border border-blue-200 w-full">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateQuantity(cartKey, Math.max(0, quantity - 1));
                            }}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                          <span className="w-6 text-center font-bold text-slate-900 text-sm tabular-nums">
                            {quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateQuantity(cartKey, quantity + 1);
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}