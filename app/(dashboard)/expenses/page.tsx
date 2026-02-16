// app/(dashboard)/expenses/page.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, X, FilterX, Edit, Trash2, 
  MoreVertical, ChevronDown, Check, Receipt, Calendar,
  CreditCard, Wallet, Smartphone, Building2, ArrowDownRight,
  CalendarDays, FileText, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useExpenses, useDeleteExpense, useCreateExpense, useUpdateExpense } from '@/app/hooks/use-expenses';
import type { Expense, ExpenseCategory, ExpensePaymentMethod } from '@/app/types/expense';

// ============================================================================
// Constants & Configuration
// ============================================================================

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'SUPPLIES', label: 'Supplies' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'SALARIES', label: 'Salaries' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'RENT', label: 'Rent' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'OTHER', label: 'Other' },
] as const;

const MODAL_CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'SUPPLIES', label: 'Supplies' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'SALARIES', label: 'Salaries' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'RENT', label: 'Rent' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'OTHER', label: 'Other' },
];

const PAYMENT_METHOD_OPTIONS: { value: ExpensePaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
] as const;

type CategoryFilterType = 'all' | ExpenseCategory;
type DateRangeType = typeof DATE_RANGE_OPTIONS[number]['value'];

const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; color: string; bg: string }> = {
  UTILITIES: { label: 'Utilities', color: 'text-amber-700', bg: 'bg-amber-50' },
  SUPPLIES: { label: 'Supplies', color: 'text-blue-700', bg: 'bg-blue-50' },
  MAINTENANCE: { label: 'Maintenance', color: 'text-orange-700', bg: 'bg-orange-50' },
  SALARIES: { label: 'Salaries', color: 'text-purple-700', bg: 'bg-purple-50' },
  MARKETING: { label: 'Marketing', color: 'text-green-700', bg: 'bg-green-50' },
  RENT: { label: 'Rent', color: 'text-pink-700', bg: 'bg-pink-50' },
  EQUIPMENT: { label: 'Equipment', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  OTHER: { label: 'Other', color: 'text-slate-700', bg: 'bg-slate-50' },
};

const PAYMENT_CONFIG: Record<ExpensePaymentMethod, { icon: any; label: string }> = {
  CASH: { icon: Wallet, label: 'Cash' },
  CARD: { icon: CreditCard, label: 'Card' },
  UPI: { icon: Smartphone, label: 'UPI' },
  BANK_TRANSFER: { icon: Building2, label: 'Bank' },
};

// ============================================================================
// Add/Edit Expense Modal Component
// ============================================================================

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

function AddExpenseModal({ isOpen, onClose, expenseToEdit }: AddExpenseModalProps) {
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  
  const isEditing = !!expenseToEdit;
  const isLoading = createExpense.isPending || updateExpense.isPending;

  const [formData, setFormData] = useState({
    description: '',
    category: 'OTHER' as ExpenseCategory,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH' as ExpensePaymentMethod,
    vendor: '',
    receipt: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        description: expenseToEdit.description,
        category: expenseToEdit.category,
        amount: expenseToEdit.amount.toString(),
        date: expenseToEdit.date.split('T')[0],
        paymentMethod: expenseToEdit.paymentMethod,
        vendor: expenseToEdit.vendor || '',
        receipt: expenseToEdit.receipt || '',
        notes: expenseToEdit.notes || '',
      });
    } else {
      // Reset form for new expense
      setFormData({
        description: '',
        category: 'OTHER',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        vendor: '',
        receipt: '',
        notes: '',
      });
    }
    setErrors({});
  }, [expenseToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      description: formData.description.trim(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      vendor: formData.vendor.trim() || null,
      receipt: formData.receipt.trim() || null,
      notes: formData.notes.trim() || null,
    };

    try {
      if (isEditing && expenseToEdit) {
        await updateExpense.mutateAsync({ id: expenseToEdit.id, data: payload });
      } else {
        await createExpense.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Electricity Bill - January"
                    className={cn(
                      'w-full h-11 px-4 rounded-xl border bg-white text-sm transition-all',
                      errors.description
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
                    )}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Amount & Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        className={cn(
                          'w-full h-11 pl-8 pr-4 rounded-xl border bg-white text-sm transition-all',
                          errors.amount
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
                        )}
                      />
                    </div>
                    {errors.amount && (
                      <p className="text-xs text-red-600 mt-1">{errors.amount}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={cn(
                          'w-full h-11 px-4 rounded-xl border bg-white text-sm transition-all',
                          errors.date
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
                        )}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-xs text-red-600 mt-1">{errors.date}</p>
                    )}
                  </div>
                </div>

                {/* Category & Payment Method Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                    >
                      {MODAL_CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as ExpensePaymentMethod })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                    >
                      {PAYMENT_METHOD_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Vendor
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      placeholder="e.g., Electricity Board"
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                    />
                  </div>
                </div>

                {/* Receipt Reference */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Receipt Reference
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.receipt}
                      onChange={(e) => setFormData({ ...formData, receipt: e.target.value })}
                      placeholder="e.g., RCP-001 or invoice number"
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional details..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-full bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isEditing ? 'Updating...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Update Expense' : 'Add Expense'}</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Main Expenses Page Component
// ============================================================================

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>('all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('all');
  const [isDateOpen, setIsDateOpen] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Fetch expenses with filters
  const { data: expensesData, isLoading, isError } = useExpenses({
    search: searchQuery || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    dateRange: dateRange,
    sortBy: 'date',
    sortOrder: 'desc',
    limit: 100,
  });

  const deleteExpense = useDeleteExpense();

  const expenses = expensesData?.data || [];

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    
    expenses.forEach((expense) => {
      const dateKey = expense.date.split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });
    
    return groups;
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all' || dateRange !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDateRange('all');
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsAddModalOpen(true);
  };

  const handleDeleteExpense = async () => {
    if (expenseToDelete) {
      await deleteExpense.mutateAsync(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setExpenseToEdit(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const currentCategory = CATEGORY_OPTIONS.find(opt => opt.value === categoryFilter);
  const currentDateRange = DATE_RANGE_OPTIONS.find(opt => opt.value === dateRange);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsCategoryOpen(false);
      setIsDateOpen(false);
    };
    if (isCategoryOpen || isDateOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isCategoryOpen, isDateOpen]);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="border-b border-slate-200">
        <div className="px-4 lg:px-6 py-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Expenses</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">Track and manage business expenses</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-red-600">
                  ₹{totalExpenses.toLocaleString('en-IN')} spent
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={cn(
                'h-11 flex items-center justify-center px-5 gap-2 rounded-full transition-all duration-200',
                'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm'
              )}
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="flex-1 min-w-0">
              <div 
                className={cn(
                  'flex items-center h-11 rounded-full border bg-white transition-all duration-200',
                  isSearchFocused 
                    ? 'border-blue-500 ring-4 ring-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Search 
                  className={cn(
                    'w-4 h-4 ml-4 shrink-0 transition-colors',
                    isSearchFocused ? 'text-blue-500' : 'text-slate-400'
                  )} 
                />
                <input
                  type="text"
                  placeholder="Search expenses or vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="flex-1 h-full bg-transparent border-0 outline-none text-sm placeholder:text-slate-400 px-3 min-w-0"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery('')}
                      className="mr-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Date Range Dropdown */}
            <div className="relative w-full sm:w-44">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDateOpen(!isDateOpen);
                  setIsCategoryOpen(false);
                }}
                className={cn(
                  'w-full h-11 flex items-center justify-between gap-2 px-4 rounded-full border bg-white transition-all duration-200',
                  isDateOpen
                    ? 'border-blue-500 ring-4 ring-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  <span className="truncate text-sm font-medium text-slate-700">
                    {currentDateRange?.label}
                  </span>
                </div>
                <ChevronDown className={cn(
                  'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
                  isDateOpen && 'rotate-180'
                )} />
              </button>

              <AnimatePresence>
                {isDateOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-1.5">
                      {DATE_RANGE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setDateRange(option.value);
                            setIsDateOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-150',
                            dateRange === option.value
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'hover:bg-slate-50 text-slate-700'
                          )}
                        >
                          <span className="text-sm">{option.label}</span>
                          {dateRange === option.value && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full sm:w-48">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsDateOpen(false);
                }}
                className={cn(
                  'w-full h-11 flex items-center justify-between gap-2 px-4 rounded-full border bg-white transition-all duration-200',
                  isCategoryOpen
                    ? 'border-blue-500 ring-4 ring-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <span className="truncate text-sm font-medium text-slate-700">
                  {currentCategory?.label}
                </span>
                <ChevronDown className={cn(
                  'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
                  isCategoryOpen && 'rotate-180'
                )} />
              </button>

              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-1.5">
                      {CATEGORY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setCategoryFilter(option.value as CategoryFilterType);
                            setIsCategoryOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-150',
                            categoryFilter === option.value
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'hover:bg-slate-50 text-slate-700'
                          )}
                        >
                          <span className="text-sm">{option.label}</span>
                          {categoryFilter === option.value && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear Filters */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: 'auto' }}
                  exit={{ opacity: 0, scale: 0.9, width: 0 }}
                  onClick={handleClearFilters}
                  className={cn(
                    'h-11 flex items-center justify-center px-5 gap-2 rounded-full border transition-all duration-200',
                    'bg-white border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600',
                    'text-slate-600 font-medium text-sm overflow-hidden'
                  )}
                >
                  <FilterX className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Clear</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count */}
          <AnimatePresence>
            {(hasActiveFilters || expenses.length > 0) && !isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-full border border-slate-100 w-fit">
                  <Receipt className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{expenses.length}</span> expenses totaling{' '}
                    <span className="font-semibold text-red-600">₹{totalExpenses.toLocaleString('en-IN')}</span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-slate-500">Loading expenses...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load expenses</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm">
              There was an error loading your expenses. Please try again.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && expenses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200">
                <Receipt className="w-9 h-9 text-slate-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                <Search className="w-3 h-3 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {hasActiveFilters ? 'No expenses found' : 'No expenses yet'}
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
              {hasActiveFilters
                ? "We couldn't find any expenses matching your filters. Try adjusting your search or date range."
                : 'Start tracking your business expenses by adding your first expense.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="h-10 px-5 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2"
              >
                <FilterX className="w-4 h-4" />
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="h-10 px-5 rounded-full bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Expense
              </button>
            )}
          </motion.div>
        )}

        {/* Expenses List */}
        {!isLoading && !isError && expenses.length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedExpenses).map(([dateKey, dateExpenses]) => {
              const dayTotal = dateExpenses.reduce((sum, e) => sum + e.amount, 0);
              
              return (
                <div key={dateKey}>
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatDate(dateKey)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {dateExpenses.length} {dateExpenses.length === 1 ? 'expense' : 'expenses'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      -₹{dayTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-100">
                        {dateExpenses.map((expense, index) => {
                          const PaymentIcon = PAYMENT_CONFIG[expense.paymentMethod].icon;
                          const categoryConfig = CATEGORY_CONFIG[expense.category];
                          
                          return (
                            <tr
                              key={expense.id}
                              className={cn(
                                "hover:bg-slate-50/70 transition-colors",
                                index === 0 && "rounded-t-2xl"
                              )}
                            >
                              {/* Description */}
                              <td className="py-4 px-5 w-[40%]">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                    categoryConfig.bg
                                  )}>
                                    <ArrowDownRight className={cn("w-5 h-5", categoryConfig.color)} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-900 truncate">
                                      {expense.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className={cn(
                                        "text-xs font-medium px-2 py-0.5 rounded-full",
                                        categoryConfig.bg,
                                        categoryConfig.color
                                      )}>
                                        {categoryConfig.label}
                                      </span>
                                      {expense.receipt && (
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                          <FileText className="w-3 h-3" />
                                          {expense.receipt}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Vendor */}
                              <td className="py-4 px-5 w-[20%]">
                                {expense.vendor ? (
                                  <span className="text-sm text-slate-600">{expense.vendor}</span>
                                ) : (
                                  <span className="text-sm text-slate-300">—</span>
                                )}
                              </td>

                              {/* Payment Method */}
                              <td className="py-4 px-5 w-[15%]">
                                <div className="flex items-center gap-2">
                                  <PaymentIcon className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    {PAYMENT_CONFIG[expense.paymentMethod].label}
                                  </span>
                                </div>
                              </td>

                              {/* Amount */}
                              <td className="py-4 px-5 w-[15%] text-right">
                                <span className="font-semibold text-red-600">
                                  -₹{expense.amount.toLocaleString('en-IN')}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-5 w-[10%]">
                                <div className="flex items-center justify-end">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-lg">
                                      <DropdownMenuItem 
                                        onClick={() => handleEditExpense(expense)}
                                        className="cursor-pointer"
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Expense
                                      </DropdownMenuItem>
                                      {expense.receipt && (
                                        <DropdownMenuItem className="cursor-pointer">
                                          <FileText className="w-4 h-4 mr-2" />
                                          View Receipt
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => setExpenseToDelete(expense)}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile List */}
                  <div className="lg:hidden space-y-2">
                    {dateExpenses.map((expense) => {
                      const PaymentIcon = PAYMENT_CONFIG[expense.paymentMethod].icon;
                      const categoryConfig = CATEGORY_CONFIG[expense.category];
                      
                      return (
                        <div
                          key={expense.id}
                          className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                categoryConfig.bg
                              )}>
                                <ArrowDownRight className={cn("w-5 h-5", categoryConfig.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {expense.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className={cn(
                                    "text-xs font-medium px-2 py-0.5 rounded-full",
                                    categoryConfig.bg,
                                    categoryConfig.color
                                  )}>
                                    {categoryConfig.label}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <PaymentIcon className="w-3 h-3" />
                                    <span>{PAYMENT_CONFIG[expense.paymentMethod].label}</span>
                                  </div>
                                </div>
                                {expense.vendor && (
                                  <p className="text-xs text-slate-500 mt-1">{expense.vendor}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="font-semibold text-red-600 whitespace-nowrap">
                                -₹{expense.amount.toLocaleString('en-IN')}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 bg-white border border-slate-200 shadow-lg">
                                  <DropdownMenuItem 
                                    onClick={() => handleEditExpense(expense)}
                                    className="cursor-pointer text-sm"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => setExpenseToDelete(expense)}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer text-sm"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        expenseToEdit={expenseToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!expenseToDelete} onOpenChange={() => setExpenseToDelete(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
              {expenseToDelete && (
                <span className="block mt-2 font-medium text-slate-700">
                  "{expenseToDelete.description}" - ₹{expenseToDelete.amount.toLocaleString('en-IN')}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpense}
              className="rounded-full bg-red-600 hover:bg-red-700"
            >
              {deleteExpense.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}