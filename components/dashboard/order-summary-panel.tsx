'use client';

import { useState } from 'react';
import { Search, Plus, Minus, Star, MapPin, Phone, Trash2, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  icon: string;
}

interface OrderSummaryPanelProps {
  items: OrderItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onReviewOrder: () => void;
}

export function OrderSummaryPanel({
  items,
  onUpdateQuantity,
  onReviewOrder,
}: OrderSummaryPanelProps) {
  const [notes, setNotes] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Customer Search */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex-shrink-0">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2 sm:mb-3">
          Customer Details
        </h3>
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search by Name/Mobile"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="pr-8 bg-slate-50 border-slate-200 h-9 sm:h-10 text-sm"
            />
            {customerSearch && (
              <button
                onClick={() => setCustomerSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
          <Button size="icon" className="bg-blue-50 hover:bg-blue-200 text-blue-700 flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10">
            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button size="icon" variant="outline" className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10" title="Add New Customer">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Customer Info Card */}
        <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 border border-slate-200">
          <div className="flex items-start justify-between mb-1.5 sm:mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                Krishnakant Patel
              </h4>
              <div className="flex items-center gap-0.5 sm:gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-2.5 h-2.5 sm:w-3 sm:h-3',
                      i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                    )}
                  />
                ))}
                <span className="text-[10px] sm:text-xs text-slate-500 ml-0.5 sm:ml-1">4.0</span>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs">
              Active
            </Badge>
          </div>
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-600">
              <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-600">
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">
                123, MG Road, Near City Mall, Bangalore - 560001
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50 min-h-0">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="font-semibold text-xs sm:text-sm text-slate-900">Order Items</h3>
          {items.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs">
              {totalItems} items
            </Badge>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 sm:py-12 bg-white rounded-lg border border-slate-200"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">No items added yet</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Select items to create an order</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group relative bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all p-2.5 sm:p-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Item Icon */}
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 flex-shrink-0">
                      <span className="text-xl sm:text-2xl">{item.icon}</span>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => onUpdateQuantity(item.id, 0)}
                    >
                      <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 sm:h-7 sm:w-7 rounded-md hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      >
                        <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                      <span className="w-6 sm:w-8 text-center font-bold text-xs sm:text-sm text-slate-900">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 sm:h-7 sm:w-7 rounded-md hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs text-slate-500">Total</p>
                      <p className="text-xs sm:text-sm font-bold text-blue-600">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-200 space-y-2 sm:space-y-3 bg-white flex-shrink-0">
        {/* Notes */}
        <div>
          <label className="text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 sm:mb-1.5 block">
            Order Notes
          </label>
          <Textarea
            placeholder="Special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none h-12 sm:h-16 text-xs sm:text-sm bg-slate-50 border-slate-200"
          />
        </div>

        {/* Price Summary */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-slate-50 rounded-lg p-2.5 sm:p-3 border border-slate-200"
          >
            <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-900">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Items</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs">
                  {totalItems}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}

        {/* Review Order Button */}
        <Button
          className={cn(
            'w-full h-10 sm:h-12 text-sm sm:text-base font-semibold transition-all',
            items.length === 0
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
          )}
          disabled={items.length === 0}
          onClick={onReviewOrder}
        >
          {items.length === 0 ? (
            <span>Add items to continue</span>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span>Review Order</span>
              <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}