'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, X, FilterX, ListFilter, ChevronDown, Check, Plus } from 'lucide-react';
import { OrdersTable } from './components/orders-table';
import { OrderStatus, Order } from '@/app/types/order';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// STATUS OPTIONS
// ============================================
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders', headerTitle: 'Orders', description: 'Manage and track all laundry orders', dot: 'bg-slate-400' },
  { value: 'new', label: 'New', headerTitle: 'New Orders', description: 'Recently received orders awaiting processing', dot: 'bg-blue-500' },
  { value: 'processing', label: 'Processing', headerTitle: 'Processing Orders', description: 'Orders currently being processed', dot: 'bg-amber-500' },
  { value: 'workshop', label: 'Workshop', headerTitle: 'Workshop Orders', description: 'Orders sent to external workshop', dot: 'bg-purple-500' },
  { value: 'ready', label: 'Ready', headerTitle: 'Ready Orders', description: 'Orders ready for pickup or delivery', dot: 'bg-green-500' },
  { value: 'delivery', label: 'Delivery', headerTitle: 'Orders in Delivery', description: 'Orders currently out for delivery', dot: 'bg-indigo-500' },
  { value: 'completed', label: 'Completed', headerTitle: 'Completed Orders', description: 'Successfully delivered orders', dot: 'bg-emerald-500' },
  { value: 'cancelled', label: 'Cancelled', headerTitle: 'Cancelled Orders', description: 'Orders that were cancelled', dot: 'bg-red-500' },
] as const;

// ============================================
// MOCK DATA
// ============================================
const MOCK_ORDERS_DATA = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: { name: 'Rajesh Kumar', phone: '+91 98765 43210', address: '123 MG Road, Bangalore' },
    items: [],
    totalItems: 5,
    services: ['Wash', 'Iron', 'Fold'],
    specialInstructions: 'Use fabric softener',
    totalAmount: 1250,
    paidAmount: 1250,
    status: 'completed' as OrderStatus,
    orderDate: '2024-01-15T10:30:00',
    deliveryDate: '2024-01-17T18:00:00',
    paymentMode: 'upi' as const,
    workshopItems: 0,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: { name: 'Priya Sharma', phone: '+91 98765 43211', address: '456 Koramangala, Bangalore' },
    items: [],
    totalItems: 8,
    services: ['Dry Clean', 'Press'],
    specialInstructions: 'Handle silk items carefully',
    totalAmount: 2100,
    paidAmount: 1000,
    status: 'processing' as OrderStatus,
    orderDate: '2024-01-16T09:15:00',
    deliveryDate: '2024-01-18T17:00:00',
    paymentMode: 'cash' as const,
    workshopItems: 0,
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: { name: 'Amit Patel', phone: '+91 98765 43212', address: '789 Indiranagar, Bangalore' },
    items: [],
    totalItems: 3,
    services: ['Wash', 'Fold'],
    specialInstructions: null,
    totalAmount: 850,
    paidAmount: 0,
    status: 'new' as OrderStatus,
    orderDate: '2024-01-16T11:45:00',
    deliveryDate: '2024-01-19T16:00:00',
    paymentMode: 'online' as const,
    workshopItems: 0,
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customer: { name: 'Sneha Reddy', phone: '+91 98765 43213', address: '321 Whitefield, Bangalore' },
    items: [],
    totalItems: 12,
    services: ['Wash', 'Iron', 'Starch', 'Fold'],
    specialInstructions: 'Extra starch on shirts',
    totalAmount: 3500,
    paidAmount: 3500,
    status: 'ready' as OrderStatus,
    orderDate: '2024-01-15T14:20:00',
    deliveryDate: '2024-01-17T15:00:00',
    paymentMode: 'card' as const,
    workshopItems: 0,
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customer: { name: 'Vikram Singh', phone: '+91 98765 43214', address: '654 HSR Layout, Bangalore' },
    items: [],
    totalItems: 6,
    services: ['Dry Clean'],
    specialInstructions: 'Urgent - wedding event',
    totalAmount: 1800,
    paidAmount: 1800,
    status: 'delivery' as OrderStatus,
    orderDate: '2024-01-16T08:00:00',
    deliveryDate: '2024-01-17T20:00:00',
    paymentMode: 'upi' as const,
    workshopItems: 0,
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    customer: { name: 'Ananya Iyer', phone: '+91 98765 43215', address: '987 Jayanagar, Bangalore' },
    items: [],
    totalItems: 4,
    services: ['Wash', 'Iron'],
    specialInstructions: null,
    totalAmount: 1100,
    paidAmount: 1100,
    status: 'workshop' as OrderStatus,
    orderDate: '2024-01-15T16:30:00',
    deliveryDate: '2024-01-17T12:00:00',
    paymentMode: 'cash' as const,
    workshopItems: 4,
  },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function OrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const urlStatus = searchParams.get('status') as OrderStatus | 'all' | null;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(urlStatus || 'all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (urlStatus) {
      setStatusFilter(urlStatus);
    } else {
      setStatusFilter('all');
    }
  }, [urlStatus]);

  const handleStatusChange = (value: OrderStatus | 'all') => {
    setStatusFilter(value);
    setIsSelectOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const MOCK_ORDERS: Order[] = useMemo(() => 
    MOCK_ORDERS_DATA.map(order => ({
      ...order,
      orderDate: new Date(order.orderDate),
      deliveryDate: new Date(order.deliveryDate),
    })),
    []
  );

  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter((order) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.phone.includes(query);
        if (!matchesSearch) return false;
      }
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [searchQuery, statusFilter, MOCK_ORDERS]);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    router.push(pathname);
  };

  const currentStatus = STATUS_OPTIONS.find(opt => opt.value === statusFilter);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsSelectOpen(false);
    if (isSelectOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isSelectOpen]);

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-slate-200">
        <div className="px-4 lg:px-6 py-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Status Indicator Dot */}
              <div className={cn('w-3 h-3 rounded-full', currentStatus?.dot)} />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {currentStatus?.headerTitle || 'Orders'}
                </h1>
                <p className="text-sm text-slate-500">
                  {currentStatus?.description || 'Manage and track all laundry orders'}
                </p>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
            
            {/* Search Bar */}
            <div className="flex-1 min-w-0">
              <div 
                style={{ height: '44px' }}
                className={cn(
                  'flex items-center rounded-full border bg-white transition-all duration-200',
                  isSearchFocused 
                    ? 'border-blue-400 ring-4 ring-blue-50 shadow-lg shadow-blue-100/50'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Search 
                  className={cn(
                    'w-5 h-5 ml-4 shrink-0 transition-colors',
                    isSearchFocused ? 'text-blue-500' : 'text-slate-400'
                  )} 
                />
                <input
                  type="text"
                  placeholder="Search orders..."
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

            {/* Status Select (Custom) */}
            <div className="relative w-full sm:w-44">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelectOpen(!isSelectOpen);
                }}
                style={{ height: '44px' }}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-4 rounded-full border bg-white transition-all duration-200',
                  isSelectOpen
                    ? 'border-blue-400 ring-4 ring-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', currentStatus?.dot)} />
                  <span className="truncate text-sm font-medium text-slate-700">
                    {currentStatus?.label}
                  </span>
                </div>
                <ChevronDown className={cn(
                  'w-4 h-4 text-slate-400 shrink-0 transition-transform',
                  isSelectOpen && 'rotate-180'
                )} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {isSelectOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value as OrderStatus | 'all')}
                        className={cn(
                          'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors',
                          statusFilter === option.value
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={cn('w-2 h-2 rounded-full shrink-0', option.dot)} />
                          <span className="text-sm font-medium">{option.label}</span>
                        </div>
                        {statusFilter === option.value && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear Filters Button */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: 'auto' }}
                  exit={{ opacity: 0, scale: 0.9, width: 0 }}
                  onClick={handleClearFilters}
                  style={{ height: '44px' }}
                  className={cn(
                    'flex items-center justify-center px-4 gap-2 rounded-full border bg-white transition-all duration-200',
                    'border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600',
                    'text-slate-600'
                  )}
                >
                  <FilterX className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Clear</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-blue-50 rounded-full border border-blue-100 w-fit">
                  <ListFilter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Showing <span className="font-semibold">{filteredOrders.length}</span> of{' '}
                    <span className="font-semibold">{MOCK_ORDERS.length}</span> orders
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        <OrdersTable orders={filteredOrders} />
      </div>
    </div>
  );
}