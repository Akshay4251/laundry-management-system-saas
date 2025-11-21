'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, X, Download, RefreshCw } from 'lucide-react';
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

  const hasActiveFilters = 
    searchQuery !== '' || 
    statusFilter !== 'all' || 
    dateRange.from !== undefined || 
    dateRange.to !== undefined;

  return (
    <div className="space-y-4">
      {/* Search and Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
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
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={onExport}
            className="h-10 px-4 border-slate-200 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
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
            {[
              searchQuery && 'search',
              statusFilter !== 'all' && 'status',
              (dateRange.from || dateRange.to) && 'date',
            ].filter(Boolean).length} filter(s) active
          </div>
        )}
      </div>
    </div>
  );
}