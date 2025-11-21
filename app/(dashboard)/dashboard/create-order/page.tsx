'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Check, Minus, X, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OrderSummaryPanel } from '@/components/dashboard/order-summary-panel';
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
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface ClothingItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  category: string;
  count?: number;
  popular?: boolean;
}

const clothingItems: ClothingItem[] = [
  // Dry Cleaning
  { id: '1', name: 'Jeans', icon: '👖', price: 46, category: 'dry-cleaning', popular: true },
  { id: '2', name: 'Baby Shirt', icon: '👕', price: 25, category: 'dry-cleaning', count: 10 },
  { id: '3', name: 'Baby Suit', icon: '🧥', price: 55, category: 'dry-cleaning' },
  { id: '4', name: 'Dress', icon: '👗', price: 46, category: 'dry-cleaning', popular: true },
  { id: '5', name: 'T-Shirt', icon: '👔', price: 20, category: 'dry-cleaning' },
  { id: '6', name: 'Blazer', icon: '🧥', price: 80, category: 'dry-cleaning' },
  { id: '7', name: 'Coat', icon: '🧥', price: 95, category: 'dry-cleaning' },
  { id: '8', name: 'Jacket', icon: '🧥', price: 70, category: 'dry-cleaning' },
  { id: '9', name: 'Skirt', icon: '👗', price: 35, category: 'dry-cleaning' },
  { id: '10', name: 'Pants', icon: '👖', price: 40, category: 'dry-cleaning' },
  
  // Wet Wash
  { id: '11', name: 'Saree', icon: '🥻', price: 65, category: 'wet-wash', popular: true },
  { id: '12', name: 'Bedsheet', icon: '🛏️', price: 40, category: 'wet-wash', count: 5 },
  { id: '13', name: 'Towel', icon: '🧺', price: 15, category: 'wet-wash' },
  { id: '14', name: 'Curtain', icon: '🪟', price: 50, category: 'wet-wash' },
  { id: '15', name: 'Blanket', icon: '🛏️', price: 85, category: 'wet-wash' },
  { id: '16', name: 'Pillow Cover', icon: '🛏️', price: 20, category: 'wet-wash' },
  
  // All Others
  { id: '17', name: 'Uniform', icon: '👔', price: 45, category: 'all-others' },
  { id: '18', name: 'Kurti', icon: '👘', price: 38, category: 'all-others' },
  { id: '19', name: 'Salwar', icon: '👘', price: 42, category: 'all-others' },
  { id: '20', name: 'Shawl', icon: '🧣', price: 55, category: 'all-others' },
];

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  icon: string;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const toggleItem = (item: ClothingItem) => {
    const newSelected = new Map(selectedItems);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
      setOrderItems(orderItems.filter((oi) => oi.id !== item.id));
    } else {
      newSelected.set(item.id, 1);
      setOrderItems([
        ...orderItems,
        {
          id: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
          icon: item.icon,
        },
      ]);
    }
    setSelectedItems(newSelected);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      const newSelected = new Map(selectedItems);
      newSelected.delete(itemId);
      setSelectedItems(newSelected);
      setOrderItems(orderItems.filter((item) => item.id !== itemId));
    } else {
      const newSelected = new Map(selectedItems);
      newSelected.set(itemId, quantity);
      setSelectedItems(newSelected);
      setOrderItems(
        orderItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleReviewOrder = () => {
    localStorage.setItem('currentOrder', JSON.stringify(orderItems));
    router.push('/dashboard/order-review');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredItems = clothingItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dryCleaning = filteredItems.filter((item) => item.category === 'dry-cleaning');
  const wetWash = filteredItems.filter((item) => item.category === 'wet-wash');
  const allOthers = filteredItems.filter((item) => item.category === 'all-others');

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] gap-0 lg:gap-4">
        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4 pb-24 lg:pb-4">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-3 sm:mb-4 bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm"
          >
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3">
                Found <span className="font-medium text-slate-700">{filteredItems.length}</span> items matching "{searchQuery}"
              </p>
            )}
          </motion.div>

          {/* Categories */}
          <Accordion
            type="multiple"
            defaultValue={['dry-cleaning', 'wet-wash', 'all-others']}
            className="space-y-2 sm:space-y-3"
          >
            {/* Dry Cleaning */}
            {dryCleaning.length > 0 && (
              <AccordionItem
                value="dry-cleaning"
                className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-3 sm:px-5 py-3 sm:py-4 hover:no-underline hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-sm sm:text-base font-semibold text-slate-900">
                      Dry Cleaning
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500 font-normal">
                      ({dryCleaning.length} items)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-5 pt-1">
                  <ItemGrid
                    items={dryCleaning}
                    selectedItems={selectedItems}
                    onToggleItem={toggleItem}
                    onUpdateQuantity={updateItemQuantity}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Wet Wash */}
            {wetWash.length > 0 && (
              <AccordionItem
                value="wet-wash"
                className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-3 sm:px-5 py-3 sm:py-4 hover:no-underline hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-sm sm:text-base font-semibold text-slate-900">
                      Wet Wash
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500 font-normal">
                      ({wetWash.length} items)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-5 pt-1">
                  <ItemGrid
                    items={wetWash}
                    selectedItems={selectedItems}
                    onToggleItem={toggleItem}
                    onUpdateQuantity={updateItemQuantity}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {/* All Others */}
            {allOthers.length > 0 && (
              <AccordionItem
                value="all-others"
                className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-3 sm:px-5 py-3 sm:py-4 hover:no-underline hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-sm sm:text-base font-semibold text-slate-900">
                      All Others
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500 font-normal">
                      ({allOthers.length} items)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 sm:px-5 pb-3 sm:pb-5 pt-1">
                  <ItemGrid
                    items={allOthers}
                    selectedItems={selectedItems}
                    onToggleItem={toggleItem}
                    onUpdateQuantity={updateItemQuantity}
                  />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-16 bg-white rounded-lg border border-slate-200 shadow-sm"
            >
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                No items found
              </h3>
              <p className="text-sm sm:text-base text-slate-500">
                Try searching with a different term
              </p>
            </motion.div>
          )}
        </div>

        {/* Desktop: Fixed Sidebar */}
        <div className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] w-[400px] flex-shrink-0 p-4 pl-0">
          <OrderSummaryPanel
            items={orderItems}
            onUpdateQuantity={updateItemQuantity}
            onReviewOrder={handleReviewOrder}
          />
        </div>
      </div>

      {/* Mobile: Bottom Fixed Cart Button + Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg z-50">
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className={cn(
                'w-full h-14 text-base font-semibold transition-all relative',
                orderItems.length === 0
                  ? 'bg-slate-300 text-slate-500'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
              )}
              disabled={orderItems.length === 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {orderItems.length === 0 ? (
                'No items selected'
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span>View Cart ({totalItems})</span>
                  <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                </div>
              )}
              {orderItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-6 w-6 flex items-center justify-center p-0">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          
          {/* ✅ FIXED: Added SheetHeader & Title for Accessibility */}
          <SheetContent side="bottom" className="h-[85vh] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Order Summary</SheetTitle>
              <SheetDescription>Review your cart items before proceeding</SheetDescription>
            </SheetHeader>
            
            <OrderSummaryPanel
              items={orderItems}
              onUpdateQuantity={updateItemQuantity}
              onReviewOrder={() => {
                setMobileSheetOpen(false);
                handleReviewOrder();
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// Item Grid Component
interface ItemGridProps {
  items: ClothingItem[];
  selectedItems: Map<string, number>;
  onToggleItem: (item: ClothingItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

function ItemGrid({
  items,
  selectedItems,
  onToggleItem,
  onUpdateQuantity,
}: ItemGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => {
          const isSelected = selectedItems.has(item.id);
          const quantity = selectedItems.get(item.id) || 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <div
                onClick={() => !isSelected && onToggleItem(item)}
                className={cn(
                  'relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 select-none',
                  isSelected
                    ? 'bg-blue-50 border-blue-400 shadow-md shadow-blue-100 cursor-default'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer active:scale-95'
                )}
              >
                {/* Popular Badge */}
                {item.popular && !isSelected && (
                  <div className="absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 rounded-full font-medium shadow-sm whitespace-nowrap">
                    Popular
                  </div>
                )}

                {/* Count Badge */}
                {item.count && !isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md"
                  >
                    {item.count}
                  </motion.div>
                )}

                {/* Selected Checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white stroke-[3]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icon */}
                <div className="flex flex-col items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className={cn(
                    "text-2xl sm:text-4xl transition-transform duration-200",
                    isSelected ? "scale-105" : "scale-100"
                  )}>
                    {item.icon}
                  </div>
                  <div className="text-center w-full">
                    <p className={cn(
                      'font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 transition-colors truncate',
                      isSelected ? 'text-slate-900' : 'text-slate-700'
                    )}>
                      {item.name}
                    </p>
                    <p className={cn(
                      'text-[10px] sm:text-xs font-medium transition-colors',
                      isSelected ? 'text-blue-700' : 'text-slate-500'
                    )}>
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Quantity Selector */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white rounded-lg p-1 sm:p-1.5 border border-blue-200 shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 sm:h-7 sm:w-7 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateQuantity(item.id, Math.max(0, quantity - 1));
                        }}
                      >
                        <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </Button>
                      <span className="w-7 sm:w-10 text-center font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                        {quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 sm:h-7 sm:w-7 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateQuantity(item.id, quantity + 1);
                        }}
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}

        {/* Add New Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: items.length * 0.02 }}
        >
          <div className="h-full min-h-[140px] sm:min-h-[160px] p-3 sm:p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group active:scale-95">
            <div className="flex flex-col items-center justify-center h-full gap-1.5 sm:gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="font-medium text-xs sm:text-sm text-slate-600 group-hover:text-blue-700 transition-colors text-center">
                Add New Item
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}