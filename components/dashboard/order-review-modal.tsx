// components/dashboard/order-review-modal.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  CreditCard,
  Truck,
  Clock,
  Package,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  FileText,
  ChevronRight,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Zap,
  Percent,
  IndianRupee,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAppContext } from '@/app/contexts/app-context';
import { useBusinessFeatures, calculateTotalWithGST } from '@/app/hooks/use-business-features';
import { ServiceIconDisplay } from '@/components/services/service-icon-display';
import { CartOrderItem } from '@/app/types/order';

// ✅ Customer interface
export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
}

// ✅ Discount type
type DiscountType = 'percentage' | 'fixed';

interface OrderReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartOrderItem[];
  customer: Customer | null;
  storeId?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  onSuccess?: () => void;
  onUpdateQuantity?: (cartKey: string, quantity: number) => void;
}

export function OrderReviewModal({
  open,
  onOpenChange,
  items,
  customer,
  storeId,
  subtotal: propSubtotal,
  tax: propTax,
  total: propTotal,
  onSuccess,
  onUpdateQuantity,
}: OrderReviewModalProps) {
  const router = useRouter();
  const { selectedStoreId } = useAppContext();
  const activeStoreId = storeId || selectedStoreId;
  
  // ✅ Get GST settings from business features
  const { 
    gstEnabled, 
    gstPercentage, 
    gstNumber,
    isLoading: featuresLoading 
  } = useBusinessFeatures();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // ✅ EXPRESS MODE STATE
  const [isExpress, setIsExpress] = useState(false);
  const EXPRESS_MULTIPLIER = 1.5;

  // Form state
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    date.setHours(17, 0, 0, 0);
    return date.toISOString().slice(0, 16);
  });

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CARD' | 'UPI' | 'ONLINE'>('CASH');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // ✅ DISCOUNT STATE
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  
  const [advancedPayment, setAdvancedPayment] = useState(0);

  // ✅ Calculate prices with Express multiplier
  const calculateItemPrice = (basePrice: number) => {
    return isExpress ? Math.round(basePrice * EXPRESS_MULTIPLIER) : basePrice;
  };

  // Calculate totals
  const subtotal = propSubtotal ?? items.reduce((sum, item) => {
    const price = calculateItemPrice(item.price);
    return sum + price * item.quantity;
  }, 0);
  
  // Calculate discount amount based on type
  const discountAmount = discountType === 'percentage' 
    ? Math.round((subtotal * discountValue) / 100)
    : Math.min(discountValue, subtotal);
  
  // ✅ Calculate after-discount subtotal for GST
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  // ✅ Use GST from business features (or prop if provided)
  const { gstAmount, total: calculatedTotal } = propTax !== undefined && propTotal !== undefined
    ? { gstAmount: propTax, total: propTotal }
    : calculateTotalWithGST(subtotalAfterDiscount, gstEnabled, gstPercentage);
  
  const total = calculatedTotal;
  const balanceAfterAdvance = total - advancedPayment;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // ✅ Update delivery date when Express mode changes
  useEffect(() => {
    const baseDate = new Date();
    if (isExpress) {
      baseDate.setDate(baseDate.getDate() + 1);
    } else {
      baseDate.setDate(baseDate.getDate() + 2);
    }
    baseDate.setHours(17, 0, 0, 0);
    setDeliveryDate(baseDate.toISOString().slice(0, 16));
  }, [isExpress]);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setSpecialInstructions('');
      setDiscountType('percentage');
      setDiscountValue(0);
      setAdvancedPayment(0);
      setIsExpress(false);
      setDeliveryType('pickup');
    }
  }, [open]);

  if (!customer) {
    return null;
  }

  const handleNext = () => {
    if (currentStep === 1 && items.length === 0) {
      toast.error('Please add items to continue');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle discount value change with validation
  const handleDiscountValueChange = (value: string) => {
    const numValue = Number(value);
    
    if (discountType === 'percentage') {
      setDiscountValue(Math.min(100, Math.max(0, numValue)));
    } else {
      setDiscountValue(Math.min(subtotal, Math.max(0, numValue)));
    }
  };

  // Reset discount value when type changes
  const handleDiscountTypeChange = (type: DiscountType) => {
    setDiscountType(type);
    setDiscountValue(0);
  };

  const handlePlaceOrder = async () => {
    if (!customer || items.length === 0 || !activeStoreId) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        storeId: activeStoreId,
        customerId: customer.id,
        orderType: 'WALKIN',
        isExpress,
        items: items.map((item) => ({
          itemId: item.id,
          treatmentId: item.treatmentId,
          quantity: item.quantity,
          unitPrice: item.price,
          expressPrice: isExpress ? Math.round(item.price * EXPRESS_MULTIPLIER) : null,
          notes: item.notes || null,
        })),
        pickupDate: null,
        deliveryDate: new Date(deliveryDate).toISOString(),
        deliveryType,
        notes: specialInstructions || null,
        paymentMethod: paymentMode,
        paidAmount: advancedPayment,
        discountType,
        discountValue,
        discountAmount,
        subtotal,
        // ✅ Send GST info
        gstEnabled,
        gstPercentage: gstEnabled ? gstPercentage : 0,
        tax: gstAmount,
        total,
      };

      console.log('📤 Creating WALKIN order:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      console.log('📥 API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || 'Failed to create order');
      }

      const data = await response.json();
      console.log('✅ Order created:', data);

      toast.success('Order created successfully! 🎉', {
        description: `Order ${data.data.orderNumber} has been created`,
        duration: 5000,
      });

      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        router.push(`/orders/${data.data.id}`);
      }, 500);
    } catch (error) {
      console.error('💥 Error creating order:', error);
      toast.error('Failed to create order', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const steps = [
    { number: 1, title: 'Items', icon: Package },
    { number: 2, title: 'Details', icon: FileText },
    { number: 3, title: 'Payment', icon: CreditCard },
  ];

  const customerName = customer.fullName || 'Unknown Customer';
  const customerInitial = customerName.charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] h-[90vh] flex flex-col p-0 gap-0 bg-slate-50 border-0 outline-none">
        
        {/* === STICKY HEADER SECTION START === */}
        <div className="flex-shrink-0 bg-white z-10">
          <DialogHeader className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Review Order
              </DialogTitle>
              <div className="flex items-center gap-3">
                {/* ✅ EXPRESS TOGGLE */}
                <button
                  onClick={() => setIsExpress(!isExpress)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    isExpress 
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 scale-105" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  <Zap className={cn("w-4 h-4", isExpress && "animate-pulse")} />
                  Express {isExpress ? 'ON' : 'OFF'}
                </button>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-medium">{totalItems} items</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* ✅ EXPRESS BANNER */}
          <AnimatePresence>
            {isExpress && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center">
                  <p className="text-sm font-medium flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Express Mode: 1.5x pricing • Priority processing • Next day delivery
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Customer Info Bar */}
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                {customerInitial}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-slate-900">
                  {customerName}
                </h4>
                <p className="text-xs text-slate-600">{customer.phone || 'No phone'}</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                        currentStep === step.number
                          ? 'bg-blue-600 text-white'
                          : currentStep > step.number
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      )}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium hidden sm:block',
                        currentStep === step.number ? 'text-slate-900' : 'text-slate-500'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 mx-3 transition-all',
                        currentStep > step.number ? 'bg-green-500' : 'bg-slate-200'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* === STICKY HEADER SECTION END === */}

        {/* === SCROLLABLE CONTENT AREA START === */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: ITEMS */}
              {currentStep === 1 && (
                <motion.div
                  key="items"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-slate-900">Order Items</h3>

                  <div className="space-y-3">
                    {items.map((item) => {
                      const displayPrice = calculateItemPrice(item.price);
                      const itemTotal = displayPrice * item.quantity;

                      return (
                        <div
                          key={item.cartKey}
                          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <ServiceIconDisplay 
                                iconUrl={item.iconUrl} 
                                name={item.name} 
                                size="lg" 
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                                  <p className="text-xs text-blue-600 font-bold uppercase">{item.treatmentName}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-slate-500">
                                      ₹{displayPrice} × {item.quantity}
                                    </p>
                                    {isExpress && (
                                      <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                                        +50%
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {onUpdateQuantity && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                                    onClick={() => onUpdateQuantity(item.cartKey, 0)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                {onUpdateQuantity && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        onUpdateQuantity(item.cartKey, Math.max(0, item.quantity - 1))
                                      }
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="w-10 text-center font-semibold">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-8 w-8"
                                      onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                                <p className="text-lg font-bold text-blue-600 ml-auto">
                                  ₹{itemTotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {items.length === 0 && (
                      <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">No items added</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Go back and select items to continue
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: DETAILS */}
              {currentStep === 2 && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-slate-900">Order Details</h3>

                  {/* Delivery Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        How will customer receive order?
                      </label>
                      <Select value={deliveryType} onValueChange={(v: 'pickup' | 'delivery') => setDeliveryType(v)}>
                        <SelectTrigger className="h-11 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">🏪 Pickup from Store</SelectItem>
                          <SelectItem value="delivery">🚚 Home Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        Expected Ready Date
                        {isExpress && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                            Express
                          </span>
                        )}
                      </label>
                      <Input
                        type="datetime-local"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="h-11 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Special Instructions
                    </label>
                    <Textarea
                      placeholder="Any special requirements (e.g., Handle with care, Remove stains, etc.)"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="resize-none h-32 bg-white"
                    />
                  </div>

                  {/* Delivery Address (only show for home delivery) */}
                  {customer.address && deliveryType === 'delivery' && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <label className="text-sm font-medium text-slate-700 block mb-2">
                        Delivery Address
                      </label>
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{customer.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Summary Box */}
                  <div className={cn(
                    "rounded-lg p-4 border",
                    isExpress 
                      ? "bg-orange-50 border-orange-200" 
                      : "bg-blue-50 border-blue-100"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        isExpress ? "bg-orange-100" : "bg-blue-100"
                      )}>
                        {deliveryType === 'delivery' ? (
                          <Truck className={cn("w-5 h-5", isExpress ? "text-orange-600" : "text-blue-600")} />
                        ) : (
                          <Package className={cn("w-5 h-5", isExpress ? "text-orange-600" : "text-blue-600")} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                          {deliveryType === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                          {isExpress && (
                            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                              EXPRESS
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ready by: {new Date(deliveryDate).toLocaleString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT */}
              {currentStep === 3 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-slate-900">Payment Details</h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Payment Method</label>
                    <Select value={paymentMode} onValueChange={(v: 'CASH' | 'CARD' | 'UPI' | 'ONLINE') => setPaymentMode(v)}>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">💵 Cash</SelectItem>
                        <SelectItem value="CARD">💳 Card</SelectItem>
                        <SelectItem value="UPI">📱 UPI</SelectItem>
                        <SelectItem value="ONLINE">🌐 Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* DISCOUNT SECTION */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Discount</label>
                    
                    {/* Discount Type Toggle */}
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                      <button
                        type="button"
                        onClick={() => handleDiscountTypeChange('percentage')}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                          discountType === 'percentage'
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        <Percent className="w-4 h-4" />
                        Percentage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDiscountTypeChange('fixed')}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                          discountType === 'fixed'
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        <IndianRupee className="w-4 h-4" />
                        Fixed Amount
                      </button>
                    </div>

                    {/* Discount Input */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg">
                        {discountType === 'percentage' ? (
                          <Percent className="w-4 h-4 text-slate-600" />
                        ) : (
                          <IndianRupee className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max={discountType === 'percentage' ? 100 : subtotal}
                        value={discountValue}
                        onChange={(e) => handleDiscountValueChange(e.target.value)}
                        placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                        className="h-11 bg-white pl-14 text-lg font-medium"
                      />
                      {discountValue > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                            -₹{discountAmount.toFixed(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Discount Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {discountType === 'percentage' ? (
                        <>
                          {[5, 10, 15, 20, 25].map((percent) => (
                            <button
                              key={percent}
                              type="button"
                              onClick={() => setDiscountValue(percent)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                                discountValue === percent
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              )}
                            >
                              {percent}%
                            </button>
                          ))}
                        </>
                      ) : (
                        <>
                          {[10, 20, 50, 100, 200].map((amount) => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => setDiscountValue(Math.min(amount, subtotal))}
                              disabled={amount > subtotal}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                                discountValue === amount
                                  ? "bg-blue-600 text-white"
                                  : amount > subtotal
                                  ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              )}
                            >
                              ₹{amount}
                            </button>
                          ))}
                        </>
                      )}
                      {discountValue > 0 && (
                        <button
                          type="button"
                          onClick={() => setDiscountValue(0)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Advance Payment */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Advance Payment (₹)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg">
                        <IndianRupee className="w-4 h-4 text-slate-600" />
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max={total}
                        value={advancedPayment}
                        onChange={(e) => setAdvancedPayment(Math.min(Number(e.target.value), total))}
                        className="h-11 bg-white pl-14 text-lg font-medium"
                      />
                    </div>
                    {/* Quick Advance Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAdvancedPayment(Math.round(total * 0.5))}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                          advancedPayment === Math.round(total * 0.5)
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        50% (₹{Math.round(total * 0.5)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdvancedPayment(total)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                          advancedPayment === total
                            ? "bg-green-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        Full (₹{total.toFixed(0)})
                      </button>
                      {advancedPayment > 0 && (
                        <button
                          type="button"
                          onClick={() => setAdvancedPayment(0)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* ✅ UPDATED: Price Breakdown with GST from Business Features */}
                  <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      Order Summary
                      {isExpress && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Express
                        </span>
                      )}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal ({totalItems} items)</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                      </div>
                      {isExpress && (
                        <div className="flex justify-between text-orange-600">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Express Pricing
                          </span>
                          <span className="font-medium">Included</span>
                        </div>
                      )}
                      {discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 flex items-center gap-1">
                            Discount 
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              {discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`}
                            </span>
                          </span>
                          <span className="font-medium text-green-600">
                            -₹{discountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {/* ✅ GST Section - Matches OrderSummaryPanel */}
                      {gstEnabled && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 flex items-center gap-1">
                            <Receipt className="w-3 h-3 text-green-600" />
                            GST ({gstPercentage}%)
                            {gstNumber && (
                              <span className="text-[10px] text-slate-400 hidden sm:inline">
                                ({gstNumber})
                              </span>
                            )}
                          </span>
                          <span className="font-medium text-green-600">₹{gstAmount.toFixed(2)}</span>
                        </div>
                      )}

                      {!gstEnabled && !featuresLoading && (
                        <div className="flex justify-between text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            GST
                          </span>
                          <span className="italic">Not applicable</span>
                        </div>
                      )}

                      <Separator />
                      <div className="flex justify-between text-base pt-2">
                        <span className="font-semibold text-slate-900">Total Amount</span>
                        <span className="font-bold text-blue-600">₹{total.toFixed(2)}</span>
                      </div>
                      {advancedPayment > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Advance Payment</span>
                            <span className="font-medium text-orange-600">
                              -₹{advancedPayment.toFixed(2)}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-base pt-2">
                            <span className="font-semibold text-orange-600">Balance Due</span>
                            <span className="font-bold text-orange-600">
                              ₹{balanceAfterAdvance.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ready Box */}
                  <div className={cn(
                    "rounded-lg p-4 border",
                    isExpress 
                      ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
                      : "bg-green-50 border-green-200"
                  )}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={cn(
                        "w-5 h-5 mt-0.5",
                        isExpress ? "text-orange-600" : "text-green-600"
                      )} />
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-semibold mb-1",
                          isExpress ? "text-orange-900" : "text-green-900"
                        )}>
                          Ready to Create {isExpress ? 'Express ' : ''}Order
                        </h4>
                        <p className={cn(
                          "text-sm",
                          isExpress ? "text-orange-700" : "text-green-700"
                        )}>
                          Payment: <strong>{paymentMode}</strong>
                          {' '}• {deliveryType === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                          {gstEnabled && (
                            <>
                              {' '}• GST: <strong>{gstPercentage}%</strong>
                            </>
                          )}
                          {discountAmount > 0 && (
                            <>
                              {' '}• Discount: <strong>₹{discountAmount.toFixed(0)}</strong>
                            </>
                          )}
                          {advancedPayment > 0 && (
                            <>
                              {' '}• Advance: <strong>₹{advancedPayment.toFixed(0)}</strong>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* === SCROLLABLE CONTENT AREA END === */}

        {/* === STICKY FOOTER START === */}
        <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={isPlacingOrder}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right mr-4 hidden sm:block">
                <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                  Total
                  {isExpress && <Zap className="w-3 h-3 text-orange-500" />}
                  {gstEnabled && <Receipt className="w-3 h-3 text-green-500" />}
                </div>
                <div className={cn(
                  "text-xl font-bold",
                  isExpress ? "text-orange-600" : "text-slate-900"
                )}>
                  ₹{total.toFixed(2)}
                </div>
              </div>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className={cn(
                    "min-w-[140px]",
                    isExpress 
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      {isExpress ? (
                        <Zap className="w-4 h-4 mr-2" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      {isExpress ? 'Place Express' : 'Place Order'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* === STICKY FOOTER END === */}

      </DialogContent>
    </Dialog>
  );
}