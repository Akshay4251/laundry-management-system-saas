// components/dashboard/order-summary-panel.tsx

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Minus,
  MapPin,
  Phone,
  Trash2,
  ShoppingCart,
  User,
  X,
  Check,
  Loader2,
  Tag,
  UserPlus,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useCustomers,
  useCreateCustomer,
  useCheckDuplicatePhone,
  type Customer,
} from '@/app/hooks/use-customers';
import { useBusinessFeatures, calculateTotalWithGST } from '@/app/hooks/use-business-features';
import { cn } from '@/lib/utils';
import { ServiceIconDisplay } from '@/components/services/service-icon-display';
import { CartOrderItem } from '@/app/types/order';

interface OrderSummaryPanelProps {
  items: CartOrderItem[];
  onUpdateQuantity: (cartKey: string, quantity: number) => void;
  onReviewOrder: (orderData: OrderSummaryData) => void;
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

export interface OrderSummaryData {
  items: CartOrderItem[];
  customer: Customer;
  notes: string;
  subtotal: number;
  gstEnabled: boolean;
  gstPercentage: number;
  gstAmount: number;
  total: number;
}

interface CreateCustomerFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

const initialFormData: CreateCustomerFormData = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
};

export function OrderSummaryPanel({
  items,
  onUpdateQuantity,
  onReviewOrder,
  selectedCustomer,
  onSelectCustomer,
}: OrderSummaryPanelProps) {
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCustomerFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<Customer | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  const { data: customersData, isLoading: searchLoading, refetch } = useCustomers({
    search: debouncedSearch,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const customers = customersData?.data ?? [];

  const { mutateAsync: createCustomerAsync, isPending: isCreating } = useCreateCustomer();
  const { mutateAsync: checkDuplicate } = useCheckDuplicatePhone();

  const { 
    gstEnabled, 
    gstPercentage, 
    gstNumber,
    isLoading: featuresLoading 
  } = useBusinessFeatures();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { gstAmount, total } = calculateTotalWithGST(subtotal, gstEnabled, gstPercentage);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchFocused && !selectedCustomer) {
      if (searchQuery.length >= 2 || (searchQuery.length === 0 && customers.length > 0)) {
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  }, [isSearchFocused, searchQuery, selectedCustomer, customers.length]);

  useEffect(() => {
    if (!isCreateModalOpen) {
      setFormData(initialFormData);
      setFormErrors({});
      setDuplicateWarning(null);
    }
  }, [isCreateModalOpen]);

  const handleSelectCustomer = useCallback(
    (customer: Customer) => {
      onSelectCustomer(customer);
      setSearchQuery('');
      setDebouncedSearch('');
      setShowDropdown(false);
    },
    [onSelectCustomer]
  );

  const handleClearCustomer = useCallback(() => {
    onSelectCustomer(null);
    setSearchQuery('');
    setDebouncedSearch('');
    setShowDropdown(false);
  }, [onSelectCustomer]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
  }, []);

  const openCreateModal = useCallback(() => {
    setShowDropdown(false);
    setIsCreateModalOpen(true);
    if (searchQuery.trim()) {
      setFormData((prev) => ({ ...prev, fullName: searchQuery.trim() }));
    }
  }, [searchQuery]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?\d{10,}$/.test(cleanPhone)) {
      newErrors.phone = 'Enter a valid phone number (10+ digits)';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handlePhoneBlur = async () => {
    const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.length >= 10) {
      try {
        const result = await checkDuplicate({ phone: cleanPhone });
        if (result.isDuplicate && result.customer) {
          setDuplicateWarning(result.customer);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        // Ignore errors
      }
    }
  };

  const handleInputChange = (field: keyof CreateCustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (field === 'phone') {
      setDuplicateWarning(null);
    }
  };

  const handleCreateSubmit = async () => {
    if (!validateForm()) return;

    try {
      const customer = await createCustomerAsync({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
      });

      handleSelectCustomer(customer);
      setIsCreateModalOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  const handleSelectDuplicate = () => {
    if (duplicateWarning) {
      handleSelectCustomer(duplicateWarning);
      setIsCreateModalOpen(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length >= 2) setShowDropdown(true);
  };

  const handleReviewOrder = () => {
    if (!selectedCustomer || items.length === 0) return;

    const orderData: OrderSummaryData = {
      items,
      customer: selectedCustomer,
      notes,
      subtotal,
      gstEnabled,
      gstPercentage,
      gstAmount,
      total,
    };

    onReviewOrder(orderData);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex-shrink-0 space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-1.5 sm:gap-2">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            Customer Details
          </h3>
          {selectedCustomer && (
            <button
              onClick={handleClearCustomer}
              className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:bg-blue-50 transition-colors"
            >
              Change
            </button>
          )}
        </div>

        {selectedCustomer ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-blue-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleClearCustomer}
                className="p-1 sm:p-1.5 hover:bg-white/80 rounded-full text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-200 shrink-0">
                {selectedCustomer.fullName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 text-sm sm:text-base mb-0.5 sm:mb-1 truncate pr-5 sm:pr-6">
                  {selectedCustomer.fullName}
                </h4>

                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{selectedCustomer.phone}</span>
                  </div>

                  {selectedCustomer.address && (
                    <div className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{selectedCustomer.address}</span>
                    </div>
                  )}

                  {selectedCustomer.totalOrders > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700 border-0">
                        {selectedCustomer.totalOrders} orders
                      </Badge>
                      <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-0">
                        ₹{selectedCustomer.totalSpent.toFixed(0)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div ref={searchRef} className="relative w-full">
            <div className="flex items-center gap-1.5 sm:gap-2 w-full">
              <div
                className={cn(
                  'flex-1 min-w-0 flex items-center h-8 sm:h-9 rounded-lg border bg-slate-50 transition-all duration-200',
                  isSearchFocused
                    ? 'border-blue-500 ring-2 ring-blue-100 bg-white'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Search className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 sm:ml-3 shrink-0 transition-colors', isSearchFocused ? 'text-blue-500' : 'text-slate-400')} />
                <input
                  type="text"
                  placeholder="Search name or phone..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchQuery.length >= 2) setShowDropdown(true);
                  }}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="flex-1 min-w-0 h-full bg-transparent border-0 outline-none text-xs sm:text-sm px-2 sm:px-3 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="mr-1.5 sm:mr-2 p-0.5 sm:p-1 hover:bg-slate-200 rounded-full transition-colors shrink-0">
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                  </button>
                )}
              </div>

              <Button
                onClick={openCreateModal}
                size="sm"
                className="h-8 sm:h-9 px-2.5 sm:px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg font-medium text-xs sm:text-sm transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="ml-1 hidden xs:inline">New</span>
              </Button>
            </div>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 sm:mt-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-xl z-50 max-h-[240px] sm:max-h-[280px] overflow-hidden flex flex-col">
                {searchLoading ? (
                  <div className="p-4 sm:p-6 text-center">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Searching...</p>
                  </div>
                ) : customers.length === 0 ? (
                  <div className="p-4 sm:p-6 text-center bg-slate-50/50">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2 shadow-sm">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-900 font-medium">
                      {debouncedSearch ? 'No customers found' : 'No customers yet'}
                    </p>
                    <Button size="sm" onClick={openCreateModal} variant="outline" className="h-7 sm:h-8 text-[10px] sm:text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 mt-2">
                      <Plus className="w-3 h-3 mr-1" /> Create New
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-y-auto py-1">
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        className="w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 hover:bg-blue-50 transition-colors text-left group border-l-2 border-transparent hover:border-blue-500"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-[10px] sm:text-xs shrink-0 group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                          {customer.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-slate-900 truncate group-hover:text-blue-700">{customer.fullName}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] sm:text-xs text-slate-500 truncate">{customer.phone}</p>
                            {customer.totalOrders > 0 && (
                              <Badge variant="secondary" className="text-[8px] px-1 py-0 bg-slate-100 text-slate-600 border-0">
                                {customer.totalOrders}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/50 min-h-0">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <h3 className="font-semibold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 sm:gap-2">
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            Order Items
          </h3>
          {items.length > 0 && (
            <Badge variant="secondary" className="bg-white text-slate-700 border border-slate-200 shadow-sm text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
              {totalItems} items
            </Badge>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg sm:rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600">Cart is empty</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Select services to add items</p>
          </div>
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            {items.map((item) => (
              <div key={item.cartKey} className="group bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-2.5 sm:p-3 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                    <ServiceIconDisplay iconUrl={item.iconUrl} name={item.name} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-slate-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase">{item.serviceName}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="flex items-center bg-slate-50 rounded-md sm:rounded-lg border border-slate-200 h-7 sm:h-8">
                      <button
                        onClick={() => onUpdateQuantity(item.cartKey, Math.max(0, item.quantity - 1))}
                        className="w-6 sm:w-7 h-full flex items-center justify-center hover:bg-slate-100 hover:text-red-600 rounded-l-md sm:rounded-l-lg transition-colors"
                      >
                        <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                      <span className="w-6 sm:w-8 text-center text-[10px] sm:text-xs font-semibold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}
                        className="w-6 sm:w-7 h-full flex items-center justify-center hover:bg-slate-100 hover:text-green-600 rounded-r-md sm:rounded-r-lg transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => onUpdateQuantity(item.cartKey, 0)}
                      className="p-1 sm:p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md sm:rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-3 sm:space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div>
          <label className="text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 sm:mb-1.5 block flex items-center gap-1 sm:gap-1.5">
            <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" /> Order Notes
          </label>
          <Textarea
            placeholder="Special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none h-12 sm:h-14 text-xs sm:text-sm bg-slate-50 border-slate-200 rounded-lg focus-visible:ring-blue-500"
          />
        </div>

        <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-200 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-600">
            <span>Total Items</span>
            <span className="font-medium">{totalItems} pcs</span>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>

          {gstEnabled && (
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Receipt className="w-3 h-3 text-green-600" />
                GST ({gstPercentage}%)
                {gstNumber && <span className="text-[8px] text-slate-400 hidden sm:inline">({gstNumber})</span>}
              </span>
              <span className="font-medium text-green-600">₹{gstAmount.toFixed(2)}</span>
            </div>
          )}

          {!gstEnabled && !featuresLoading && (
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Receipt className="w-3 h-3" />GST
              </span>
              <span className="italic">Not applicable</span>
            </div>
          )}

          <div className="h-px bg-slate-200 w-full" />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs sm:text-sm text-slate-900">Total Amount</span>
            <span className="font-bold text-base sm:text-lg text-blue-600">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          className={cn(
            'w-full h-9 sm:h-11 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-md transition-all',
            items.length === 0 || !selectedCustomer
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.98]'
          )}
          disabled={items.length === 0 || !selectedCustomer}
          onClick={handleReviewOrder}
        >
          {!selectedCustomer ? 'Select Customer' : items.length === 0 ? 'Add Items' : (
            <span className="flex items-center gap-1.5 sm:gap-2">Review Order <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></span>
          )}
        </Button>
      </div>

      {/* Create Customer Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-xl sm:rounded-2xl p-0 gap-0 overflow-hidden bg-white mx-4">
          <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">Add New Customer</DialogTitle>
                <DialogDescription className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Create a new customer profile</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {duplicateWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-800">Customer already exists</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      <span className="font-semibold">{duplicateWarning.fullName}</span> • {duplicateWarning.phone}
                    </p>
                    <Button size="sm" variant="outline" onClick={handleSelectDuplicate} className="mt-2 h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100">
                      Use Existing Customer
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-[10px] sm:text-xs font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={cn('h-9 sm:h-10 text-xs sm:text-sm', formErrors.fullName && 'border-red-300 focus-visible:ring-red-200')}
                />
                {formErrors.fullName && <p className="text-[9px] sm:text-[10px] text-red-500 font-medium">{formErrors.fullName}</p>}
              </div>

              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-[10px] sm:text-xs font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={handlePhoneBlur}
                  className={cn('h-9 sm:h-10 text-xs sm:text-sm', formErrors.phone && 'border-red-300 focus-visible:ring-red-200')}
                />
                {formErrors.phone && <p className="text-[9px] sm:text-[10px] text-red-500 font-medium">{formErrors.phone}</p>}
              </div>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <Label className="text-[10px] sm:text-xs font-semibold text-slate-700">Email <span className="text-slate-400 font-normal">(Optional)</span></Label>
              <Input
                placeholder="customer@email.com"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={cn('h-9 sm:h-10 text-xs sm:text-sm', formErrors.email && 'border-red-300 focus-visible:ring-red-200')}
              />
              {formErrors.email && <p className="text-[9px] sm:text-[10px] text-red-500 font-medium">{formErrors.email}</p>}
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <Label className="text-[10px] sm:text-xs font-semibold text-slate-700">Address <span className="text-slate-400 font-normal">(Optional)</span></Label>
              <Textarea
                placeholder="Full address with landmark..."
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="min-h-[60px] sm:min-h-[70px] h-16 sm:h-20 resize-none text-xs sm:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-2 sm:gap-3">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating} className="h-9 sm:h-10 rounded-lg hover:bg-slate-200/50 text-xs sm:text-sm flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={isCreating || !!duplicateWarning} className="h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm px-4 sm:px-6 text-xs sm:text-sm flex-1 sm:flex-none">
              {isCreating ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Customer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { CartOrderItem };