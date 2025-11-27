'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, X, Download, FilterX, Edit, Trash2, Phone, Mail,
  MoreVertical, Calendar, MapPin, ChevronDown, Check, Users, 
  ShoppingBag, IndianRupee
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

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  joinedDate: Date;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    address: '123 MG Road, Bangalore, Karnataka 560001',
    totalOrders: 45,
    totalSpent: 28500,
    lastOrderDate: new Date('2024-01-15'),
    joinedDate: new Date('2023-06-10'),
  },
  {
    id: '2',
    name: 'Priya Sharma',
    phone: '+91 98765 43211',
    email: 'priya.sharma@email.com',
    address: '456 Koramangala, Bangalore, Karnataka 560034',
    totalOrders: 32,
    totalSpent: 19200,
    lastOrderDate: new Date('2024-01-16'),
    joinedDate: new Date('2023-08-15'),
  },
  {
    id: '3',
    name: 'Amit Patel',
    phone: '+91 98765 43212',
    address: '789 Indiranagar, Bangalore, Karnataka 560038',
    totalOrders: 12,
    totalSpent: 7800,
    lastOrderDate: new Date('2024-01-10'),
    joinedDate: new Date('2023-11-20'),
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    phone: '+91 98765 43213',
    email: 'sneha.reddy@email.com',
    address: '321 Whitefield, Bangalore, Karnataka 560066',
    totalOrders: 8,
    totalSpent: 5200,
    lastOrderDate: new Date('2023-12-25'),
    joinedDate: new Date('2023-09-05'),
  },
  {
    id: '5',
    name: 'Vikram Singh',
    phone: '+91 98765 43214',
    address: '654 HSR Layout, Bangalore, Karnataka 560102',
    totalOrders: 67,
    totalSpent: 45600,
    lastOrderDate: new Date('2024-01-17'),
    joinedDate: new Date('2023-05-12'),
  },
  {
    id: '6',
    name: 'Ananya Iyer',
    phone: '+91 98765 43215',
    email: 'ananya.iyer@email.com',
    address: '987 Jayanagar, Bangalore, Karnataka 560041',
    totalOrders: 23,
    totalSpent: 15400,
    lastOrderDate: new Date('2024-01-14'),
    joinedDate: new Date('2023-07-22'),
  },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recent Activity' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'orders', label: 'Most Orders' },
  { value: 'spent', label: 'Highest Spending' },
] as const;

type SortOption = typeof SORT_OPTIONS[number]['value'];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    let filtered = MOCK_CUSTOMERS.filter((customer) => {
      const matchesSearch = searchQuery === '' || 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'orders':
          return b.totalOrders - a.totalOrders;
        case 'spent':
          return b.totalSpent - a.totalSpent;
        case 'recent':
        default:
          return b.lastOrderDate.getTime() - a.lastOrderDate.getTime();
      }
    });

    return filtered;
  }, [searchQuery, sortBy]);

  const hasActiveFilters = searchQuery !== '';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('recent');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentSort = SORT_OPTIONS.find(opt => opt.value === sortBy);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsSortOpen(false);
    if (isSortOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isSortOpen]);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="border-b border-slate-200">
        <div className="px-4 lg:px-6 py-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Customers</h1>
              <p className="text-sm text-slate-500">Manage and track customer relationships</p>
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
                onClick={() => console.log('Add Customer')}
                className={cn(
                  'h-11 flex items-center justify-center px-5 gap-2 rounded-full transition-all duration-200',
                  'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm'
                )}
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer</span>
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
                  placeholder="Search by name, phone, or email..."
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

            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-52">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSortOpen(!isSortOpen);
                }}
                className={cn(
                  'w-full h-11 flex items-center justify-between gap-2 px-4 rounded-full border bg-white transition-all duration-200',
                  isSortOpen
                    ? 'border-blue-500 ring-4 ring-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <span className="truncate text-sm font-medium text-slate-700">
                  {currentSort?.label}
                </span>
                <ChevronDown className={cn(
                  'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
                  isSortOpen && 'rotate-180'
                )} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-1.5">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-150',
                            sortBy === option.value
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'hover:bg-slate-50 text-slate-700'
                          )}
                        >
                          <span className="text-sm">{option.label}</span>
                          {sortBy === option.value && (
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
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-full border border-blue-100 w-fit">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Showing <span className="font-semibold">{filteredCustomers.length}</span> of{' '}
                    <span className="font-semibold">{MOCK_CUSTOMERS.length}</span> customers
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        {filteredCustomers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200">
                <Users className="w-9 h-9 text-slate-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                <Search className="w-3 h-3 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No customers found</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
              We couldn't find any customers matching your search. Try adjusting your filters.
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
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                      <th className="text-left py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Last Order
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Customer Info */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm flex-shrink-0">
                              {getInitials(customer.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {customer.name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">Since {formatDate(customer.joinedDate)}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="py-4 px-5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="font-medium">{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="truncate max-w-[180px]">{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Orders */}
                        <td className="py-4 px-5">
                          <div className="flex justify-center">
                            <span className="inline-flex items-center justify-center min-w-[40px] h-8 px-3 rounded-full bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100">
                              {customer.totalOrders}
                            </span>
                          </div>
                        </td>

                        {/* Total Spent */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-slate-900 flex items-center gap-0.5">
                              <IndianRupee className="w-3.5 h-3.5" />
                              {customer.totalSpent.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">
                              ₹{Math.round(customer.totalSpent / customer.totalOrders)} avg
                            </span>
                          </div>
                        </td>

                        {/* Last Order */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col items-center">
                            <span className="font-medium text-slate-900 text-sm">
                              {formatDate(customer.lastOrderDate)}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">
                              {Math.floor((new Date().getTime() - customer.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))} days ago
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                                  <MoreVertical className="w-4 h-4 text-slate-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-lg">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Customer
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <ShoppingBag className="w-4 h-4 mr-2" />
                                  View Orders
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this customer?')) {
                                      console.log('Delete', customer.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Customer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100/30 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{customer.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Since {formatDate(customer.joinedDate)}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-lg">
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            View Orders
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600 truncate">{customer.email}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2.5 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 line-clamp-2">{customer.address}</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Orders</p>
                        <p className="font-bold text-lg text-slate-900">{customer.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Spent</p>
                        <p className="font-bold text-lg text-slate-900">
                          ₹{(customer.totalSpent / 1000).toFixed(1)}k
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Last Order</p>
                        <p className="font-semibold text-sm text-slate-900">
                          {formatDate(customer.lastOrderDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}