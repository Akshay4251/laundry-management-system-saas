'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Check, Minus, X, ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';
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
  { id: '3', name: 'Baby Suit', icon: '🧒', price: 55, category: 'dry-cleaning' },
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

const categories = [
  { id: 'dry-cleaning', name: 'Dry Cleaning', icon: '✨' },
  { id: 'wet-wash', name: 'Wet Wash', icon: '💧' },
  { id: 'all-others', name: 'All Others', icon: '📦' },
];

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
    router.push('/order-review');
  };

  const clearSearch = () => setSearchQuery('');

  const filteredItems = clothingItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getItemsByCategory = (categoryId: string) =>
    filteredItems.filter((item) => item.category === categoryId);

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Main Content */}
        <div className="flex-1 p-4 pt-0 lg:p-6 lg:pt-0 pb-28 lg:pb-6">
          
          {/* Header */}
          {/* <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-xl font-semibold text-slate-800">Create Order</h1>
            <p className="text-sm text-slate-500 mt-1">Select items to add to the order</p>
          </motion.div> */}

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative">
              <div className={cn(
                "flex items-center h-12 rounded-full border transition-all duration-200",
                searchQuery 
                  ? "border-blue-400 bg-white shadow-lg shadow-blue-100/50 ring-4 ring-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}>
                <Search className={cn(
                  "w-5 h-5 ml-5 transition-colors",
                  searchQuery ? "text-blue-500" : "text-slate-400"
                )} />
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent h-full text-sm placeholder:text-slate-400 focus-visible:ring-0 px-3"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
              
              {/* Search Results Count */}
              <AnimatePresence>
                {searchQuery && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs text-slate-500 mt-3 ml-2"
                  >
                    Found <span className="font-medium text-slate-700">{filteredItems.length}</span> items
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Accordion
              type="multiple"
              defaultValue={['dry-cleaning', 'wet-wash', 'all-others']}
              className="space-y-3"
            >
              {categories.map((category, categoryIndex) => {
                const categoryItems = getItemsByCategory(category.id);
                if (categoryItems.length === 0) return null;

                return (
                  <AccordionItem
                    key={category.id}
                    value={category.id}
                    className="border-0"
                  >
                    <AccordionTrigger className="px-4 py-4 bg-white border border-slate-200 rounded-2xl hover:no-underline hover:bg-slate-50/50 hover:border-slate-300 transition-all data-[state=open]:rounded-b-none data-[state=open]:border-b-0 group">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{category.icon}</span>
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
                      <ItemGrid
                        items={categoryItems}
                        selectedItems={selectedItems}
                        onToggleItem={toggleItem}
                        onUpdateQuantity={updateItemQuantity}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </motion.div>

          {/* Empty State */}
          <AnimatePresence>
            {filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-4"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">
                  No items found
                </h3>
                <p className="text-sm text-slate-500">
                  Try searching with a different term
                </p>
                <Button
                  variant="ghost"
                  onClick={clearSearch}
                  className="mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                >
                  Clear search
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] w-[380px] shrink-0 p-6 pt-0 pl-0">
          <div className="h-full bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <OrderSummaryPanel
              items={orderItems}
              onUpdateQuantity={updateItemQuantity}
              onReviewOrder={handleReviewOrder}
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
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
              )}
              disabled={orderItems.length === 0}
            >
              {orderItems.length === 0 ? (
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  No items selected
                </span>
              ) : (
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-normal opacity-90">
                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
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
              <SheetDescription>Review your cart items</SheetDescription>
            </SheetHeader>
            
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
            
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

// ============================================
// Item Grid Component
// ============================================
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => {
          const isSelected = selectedItems.has(item.id);
          const quantity = selectedItems.get(item.id) || 0;

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
                onClick={() => !isSelected && onToggleItem(item)}
                className={cn(
                  'relative p-4 rounded-2xl border-2 transition-all duration-200 select-none',
                  isSelected
                    ? 'bg-blue-50 border-blue-400 shadow-md shadow-blue-100'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm cursor-pointer active:scale-[0.98]'
                )}
              >
                {/* Popular Badge */}
                {item.popular && !isSelected && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Popular
                    </div>
                  </div>
                )}

                {/* Count Badge */}
                {item.count && !isSelected && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                      {item.count}
                    </div>
                  </div>
                )}

                {/* Selected Checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="absolute -top-2 -right-2 z-10"
                    >
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-600/30">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Content */}
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={cn(
                    "text-3xl sm:text-4xl mb-3 transition-transform",
                    isSelected && "scale-110"
                  )}>
                    {item.icon}
                  </div>
                  
                  {/* Name */}
                  <p className={cn(
                    'font-medium text-sm mb-1 truncate w-full',
                    isSelected ? 'text-slate-900' : 'text-slate-700'
                  )}>
                    {item.name}
                  </p>
                  
                  {/* Price */}
                  <p className={cn(
                    'text-xs font-semibold',
                    isSelected ? 'text-blue-600' : 'text-slate-500'
                  )}>
                    ₹{item.price}
                  </p>
                </div>

                {/* Quantity Selector */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="mt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-2 bg-white rounded-full p-1 border border-blue-200">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity(item.id, Math.max(0, quantity - 1));
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-bold text-slate-900 text-sm tabular-nums">
                          {quantity}
                        </span>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity(item.id, quantity + 1);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}

        {/* Add New Item Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15, delay: items.length * 0.02 }}
        >
          <div className="h-full min-h-[140px] p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group active:scale-[0.98]">
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-12 h-12 bg-slate-200 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="font-medium text-sm text-slate-500 group-hover:text-blue-600 transition-colors">
                Add Item
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}