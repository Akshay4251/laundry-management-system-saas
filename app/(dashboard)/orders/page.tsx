// app/(dashboard)/orders/page.tsx

'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, X, FilterX, ListFilter, ChevronDown, Check, Loader2 } from 'lucide-react';
import { OrdersTable } from './components/order-table';
import { OrderStatus, isStatusVisible, BusinessFeatures } from '@/app/types/order';
import { cn } from '@/lib/utils';
import { useOrders } from '@/app/hooks/use-orders';
import { useBusinessFeatures } from '@/app/hooks/use-business-features';
import { Button } from '@/components/ui/button';

const ALL_STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders', headerTitle: 'Orders', description: 'Manage and track all laundry orders', dot: 'bg-slate-400' },
  { value: 'PICKUP', label: 'Awaiting Pickup', headerTitle: 'Pickup Orders', description: 'Scheduled pickups awaiting collection from customers', dot: 'bg-amber-500' },
  { value: 'IN_PROGRESS', label: 'In Progress', headerTitle: 'Processing Orders', description: 'Orders currently being processed', dot: 'bg-blue-500' },
  { value: 'AT_WORKSHOP', label: 'At Workshop', headerTitle: 'Workshop Orders', description: 'Orders at external workshop', dot: 'bg-purple-500' },
  { value: 'WORKSHOP_RETURNED', label: 'Workshop Returned', headerTitle: 'Workshop QC', description: 'Items returned from workshop, awaiting quality check', dot: 'bg-violet-500' },
  { value: 'READY', label: 'Ready', headerTitle: 'Ready Orders', description: 'Orders ready for pickup or delivery', dot: 'bg-green-500' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', headerTitle: 'Out for Delivery', description: 'Orders currently being delivered', dot: 'bg-indigo-500' },
  { value: 'COMPLETED', label: 'Completed', headerTitle: 'Completed Orders', description: 'Successfully completed orders', dot: 'bg-emerald-500' },
  { value: 'CANCELLED', label: 'Cancelled', headerTitle: 'Cancelled Orders', description: 'Orders that were cancelled', dot: 'bg-red-500' },
] as const;

function OrdersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { features, isLoading: featuresLoading } = useBusinessFeatures();
  
  const urlStatus = searchParams.get('status') as OrderStatus | 'all' | null;
  const urlSearch = searchParams.get('search') || '';
  const urlPage = parseInt(searchParams.get('page') || '1');
  
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(urlStatus || 'all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const visibleStatusOptions = useMemo(() => {
    const defaultFeatures: BusinessFeatures = {
      pickupEnabled: true,
      deliveryEnabled: true,
      workshopEnabled: true,
    };
    
    const activeFeatures = features || defaultFeatures;
    
    return ALL_STATUS_OPTIONS.filter(option => {
      if (option.value === 'all') return true;
      return isStatusVisible(option.value as OrderStatus, activeFeatures);
    });
  }, [features]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError, error } = useOrders({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    page: urlPage,
    limit: 20,
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (urlStatus) {
      const isVisible = visibleStatusOptions.some(opt => opt.value === urlStatus);
      setStatusFilter(isVisible ? urlStatus : 'all');
    } else {
      setStatusFilter('all');
    }
  }, [urlStatus, visibleStatusOptions]);

  const updateURL = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    if (params.status !== undefined || params.search !== undefined) {
      newParams.delete('page');
    }
    
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleStatusChange = (value: OrderStatus | 'all') => {
    setStatusFilter(value);
    setIsSelectOpen(false);
    updateURL({ status: value === 'all' ? null : value });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateURL({ search: debouncedSearch || null });
    }
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('all');
    router.push(pathname);
  };

  const currentStatus = visibleStatusOptions.find(opt => opt.value === statusFilter) || visibleStatusOptions[0];

  useEffect(() => {
    const handleClickOutside = () => setIsSelectOpen(false);
    if (isSelectOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isSelectOpen]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!mounted || featuresLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={cn('w-3 h-3 rounded-full shadow-sm', currentStatus?.dot)} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{currentStatus?.headerTitle || 'Orders'}</h1>
              <p className="text-sm text-slate-500">{currentStatus?.description || 'Manage and track all laundry orders'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
          <div className="flex-1 min-w-0">
            <div
              style={{ height: '44px' }}
              className={cn(
                'flex items-center rounded-full border bg-white transition-all duration-200',
                isSearchFocused ? 'border-blue-400 ring-4 ring-blue-50 shadow-lg shadow-blue-100/50' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <Search className={cn('w-5 h-5 ml-4 shrink-0 transition-colors', isSearchFocused ? 'text-blue-500' : 'text-slate-400')} />
              <input
                type="text"
                placeholder="Search by order #, customer name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={handleSearchKeyDown}
                className="flex-1 h-full bg-transparent border-0 outline-none text-sm placeholder:text-slate-400 px-3 min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedSearch('');
                    updateURL({ search: null });
                  }}
                  className="mr-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div className="relative w-full sm:w-52">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSelectOpen(!isSelectOpen);
              }}
              style={{ height: '44px' }}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-4 rounded-full border bg-white transition-all duration-200',
                isSelectOpen ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn('w-2 h-2 rounded-full shrink-0', currentStatus?.dot)} />
                <span className="truncate text-sm font-medium text-slate-700">{currentStatus?.label}</span>
              </div>
              <ChevronDown className={cn('w-4 h-4 text-slate-400 shrink-0 transition-transform', isSelectOpen && 'rotate-180')} />
            </button>

            {isSelectOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50 max-h-[300px] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {visibleStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value as OrderStatus | 'all')}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors',
                      statusFilter === option.value ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-2 h-2 rounded-full shrink-0', option.dot)} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                    {statusFilter === option.value && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              style={{ height: '44px' }}
              className={cn(
                'flex items-center justify-center px-4 gap-2 rounded-full border bg-white transition-all duration-200',
                'border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-600'
              )}
            >
              <FilterX className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Clear</span>
            </button>
          )}
        </div>

        {(hasActiveFilters || pagination) && (
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-full border border-blue-100 w-fit">
              <ListFilter className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                Showing <span className="font-semibold">{orders.length}</span>
                {pagination && <> of <span className="font-semibold">{pagination.total}</span></>} orders
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-slate-500 font-medium">Loading orders...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-red-300 rounded-2xl bg-red-50/50">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">Failed to load orders</h3>
            <p className="text-sm text-red-600 mb-6">{error?.message || 'Something went wrong'}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <>
            <OrdersTable orders={orders} />
            
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pb-6">
                <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>Previous</Button>
                <span className="text-sm text-slate-600 px-4">Page {pagination.page} of {pagination.totalPages}</span>
                <Button variant="outline" size="sm" disabled={!pagination.hasMore} onClick={() => handlePageChange(pagination.page + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500 font-medium">Loading orders...</p>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}