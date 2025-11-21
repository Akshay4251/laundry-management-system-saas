'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, X, Download, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/app/types/order';

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: OrderStatus | 'all';
  onStatusChange: (value: OrderStatus | 'all') => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onReset: () => void;
  onExport: () => void;
  onRefresh: () => void;
}

export function OrderFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onReset,
  onExport,
  onRefresh,
}: OrderFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const hasActiveFilters = 
    searchQuery !== '' || 
    statusFilter !== 'all' || 
    dateRange.from !== undefined || 
    dateRange.to !== undefined;

  const activeFilterCount = [
    searchQuery && 'search',
    statusFilter !== 'all' && 'status',
    (dateRange.from || dateRange.to) && 'date',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Mobile Search + Filter Sheet Trigger */}
      <div className="flex gap-2 md:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-10 bg-white border-slate-200"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Sheet */}
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="default" className="relative h-10 px-3">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>Filter Orders</SheetTitle>
              <SheetDescription>
                Apply filters to refine your order list
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Order Status
                </label>
                <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as OrderStatus | 'all')}>
                  <SelectTrigger className="w-full h-11 bg-white border-slate-200">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">In Progress</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="delivery">Out for Delivery</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Date Range
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-11 justify-start text-left font-normal bg-white border-slate-200',
                        !dateRange.from && 'text-slate-500'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => {
                        onDateRangeChange({ from: range?.from, to: range?.to });
                      }}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    onRefresh();
                    setIsFilterSheetOpen(false);
                  }}
                  variant="outline"
                  className="w-full h-11"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Orders
                </Button>
                
                <Button
                  onClick={() => {
                    onExport();
                    setIsFilterSheetOpen(false);
                  }}
                  variant="outline"
                  className="w-full h-11"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </Button>

                {hasActiveFilters && (
                  <Button
                    onClick={() => {
                      onReset();
                      setIsFilterSheetOpen(false);
                    }}
                    variant="destructive"
                    className="w-full h-11"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-4">
        {/* Search and Primary Actions */}
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by order ID, customer name, phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-9 h-10 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={onRefresh}
              className="h-10 px-4 border-slate-200 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={onExport}
              className="h-10 px-4 border-slate-200 hover:bg-slate-50"
            >
              <Download className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="w-4 h-4" />
            Filters:
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as OrderStatus | 'all')}>
            <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">In Progress</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="pickup">Pickup</SelectItem>
              <SelectItem value="delivery">Out for Delivery</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-9 px-3 justify-start text-left font-normal bg-white border-slate-200',
                  !dateRange.from && 'text-slate-500'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  onDateRangeChange({ from: range?.from, to: range?.to });
                  if (range?.from && range?.to) {
                    setIsDatePickerOpen(false);
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}

          {/* Active Filter Count */}
          {hasActiveFilters && (
            <div className="ml-auto text-xs text-slate-500 font-medium">
              {activeFilterCount} filter(s) active
            </div>
          )}
        </div>
      </div>

      {/* Mobile Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex md:hidden flex-wrap gap-2">
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold">
              {statusFilter}
              <button
                onClick={() => onStatusChange('all')}
                className="ml-1.5 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(dateRange.from || dateRange.to) && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold">
              Date range
              <button
                onClick={() => onDateRangeChange({ from: undefined, to: undefined })}
                className="ml-1.5 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}