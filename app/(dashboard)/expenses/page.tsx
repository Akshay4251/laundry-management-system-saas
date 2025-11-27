'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, X, Download, FilterX, Edit, Trash2, 
  MoreVertical, ChevronDown, Check, Receipt, Calendar,
  CreditCard, Wallet, Smartphone, Building2, ArrowDownRight,
  CalendarDays, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Expense {
  id: string;
  description: string;
  category: 'utilities' | 'supplies' | 'maintenance' | 'salaries' | 'marketing' | 'other';
  amount: number;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  vendor?: string;
  receipt?: string;
}

const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    description: 'Electricity Bill - January',
    category: 'utilities',
    amount: 4500,
    date: new Date('2024-01-15'),
    paymentMethod: 'bank_transfer',
    vendor: 'Electricity Board',
  },
  {
    id: '2',
    description: 'Detergent Purchase (Bulk)',
    category: 'supplies',
    amount: 12000,
    date: new Date('2024-01-15'),
    paymentMethod: 'card',
    vendor: 'ABC Supplies',
    receipt: 'RCP-001',
  },
  {
    id: '3',
    description: 'Washing Machine Repair',
    category: 'maintenance',
    amount: 3500,
    date: new Date('2024-01-14'),
    paymentMethod: 'cash',
    vendor: 'Tech Repairs',
  },
  {
    id: '4',
    description: 'Staff Salaries - January',
    category: 'salaries',
    amount: 45000,
    date: new Date('2024-01-14'),
    paymentMethod: 'bank_transfer',
  },
  {
    id: '5',
    description: 'Facebook Ads Campaign',
    category: 'marketing',
    amount: 2000,
    date: new Date('2024-01-13'),
    paymentMethod: 'card',
    vendor: 'Meta',
  },
  {
    id: '6',
    description: 'Water Bill - January',
    category: 'utilities',
    amount: 1200,
    date: new Date('2024-01-12'),
    paymentMethod: 'upi',
    vendor: 'Water Supply',
  },
  {
    id: '7',
    description: 'Packaging Materials',
    category: 'supplies',
    amount: 3500,
    date: new Date('2024-01-10'),
    paymentMethod: 'cash',
    vendor: 'Packaging Co.',
    receipt: 'RCP-002',
  },
  {
    id: '8',
    description: 'Office Supplies',
    category: 'other',
    amount: 850,
    date: new Date('2024-01-08'),
    paymentMethod: 'card',
  },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
] as const;

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
] as const;

type CategoryType = 'all' | Expense['category'];
type DateRangeType = typeof DATE_RANGE_OPTIONS[number]['value'];

const CATEGORY_CONFIG: Record<Expense['category'], { label: string; color: string; bg: string }> = {
  utilities: { label: 'Utilities', color: 'text-amber-700', bg: 'bg-amber-50' },
  supplies: { label: 'Supplies', color: 'text-blue-700', bg: 'bg-blue-50' },
  maintenance: { label: 'Maintenance', color: 'text-orange-700', bg: 'bg-orange-50' },
  salaries: { label: 'Salaries', color: 'text-purple-700', bg: 'bg-purple-50' },
  marketing: { label: 'Marketing', color: 'text-green-700', bg: 'bg-green-50' },
  other: { label: 'Other', color: 'text-slate-700', bg: 'bg-slate-50' },
};

const PAYMENT_CONFIG: Record<Expense['paymentMethod'], { icon: any; label: string }> = {
  cash: { icon: Wallet, label: 'Cash' },
  card: { icon: CreditCard, label: 'Card' },
  upi: { icon: Smartphone, label: 'UPI' },
  bank_transfer: { icon: Building2, label: 'Bank' },
};

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('all');
  const [isDateOpen, setIsDateOpen] = useState(false);

  const filterByDateRange = (date: Date, range: DateRangeType): boolean => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return date >= startOfToday;
      case 'week':
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        return date >= startOfWeek;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return date >= startOfMonth;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
        return date >= startOfQuarter;
      default:
        return true;
    }
  };

  const filteredExpenses = useMemo(() => {
    return MOCK_EXPENSES
      .filter((expense) => {
        const matchesSearch = searchQuery === '' || 
          expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
        const matchesDate = filterByDateRange(expense.date, dateRange);

        return matchesSearch && matchesCategory && matchesDate;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [searchQuery, categoryFilter, dateRange]);

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    
    filteredExpenses.forEach((expense) => {
      const dateKey = expense.date.toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });
    
    return groups;
  }, [filteredExpenses]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all' || dateRange !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDateRange('all');
  };

  const formatDate = (date: Date) => {
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

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
            <div className="flex gap-2">
              <button
                onClick={() => console.log('Export')}
                className={cn(
                  'h-11 flex items-center justify-center px-5 gap-2 rounded-full border transition-all duration-200',
                  'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600',
                  'text-slate-600 font-medium text-sm'
                )}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => console.log('Add Expense')}
                className={cn(
                  'h-11 flex items-center justify-center px-5 gap-2 rounded-full transition-all duration-200',
                  'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm'
                )}
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </div>
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
                            setCategoryFilter(option.value);
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
            {(hasActiveFilters || filteredExpenses.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-full border border-slate-100 w-fit">
                  <Receipt className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{filteredExpenses.length}</span> expenses totaling{' '}
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
        {filteredExpenses.length === 0 ? (
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No expenses found</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
              We couldn't find any expenses matching your filters. Try adjusting your search or date range.
            </p>
            <button
              onClick={handleClearFilters}
              className="h-10 px-5 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2"
            >
              <FilterX className="w-4 h-4" />
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedExpenses).map(([dateKey, expenses]) => {
              const date = new Date(dateKey);
              const dayTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
              
              return (
                <div key={dateKey}>
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatDate(date)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
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
                        {expenses.map((expense, index) => {
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
                                      <DropdownMenuItem className="cursor-pointer">
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
                    {expenses.map((expense) => {
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
                                  <DropdownMenuItem className="cursor-pointer text-sm">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer text-sm">
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
    </div>
  );
}