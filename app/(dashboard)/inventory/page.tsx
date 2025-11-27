'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, X, Download, FilterX, Edit, Trash2, 
  MoreVertical, ChevronDown, Check, Package, AlertTriangle,
  TrendingUp, Box, Boxes, IndianRupee
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

interface InventoryItem {
  id: string;
  name: string;
  category: 'detergent' | 'softener' | 'bleach' | 'packaging' | 'equipment';
  currentStock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
  lastRestocked: Date;
  supplier: string;
}

const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Tide Detergent Powder',
    category: 'detergent',
    currentStock: 45,
    minStock: 20,
    unit: 'kg',
    costPerUnit: 280,
    lastRestocked: new Date('2024-01-10'),
    supplier: 'ABC Supplies',
  },
  {
    id: '2',
    name: 'Comfort Fabric Softener',
    category: 'softener',
    currentStock: 12,
    minStock: 15,
    unit: 'liters',
    costPerUnit: 320,
    lastRestocked: new Date('2024-01-05'),
    supplier: 'XYZ Distributors',
  },
  {
    id: '3',
    name: 'Clorox Bleach',
    category: 'bleach',
    currentStock: 8,
    minStock: 10,
    unit: 'liters',
    costPerUnit: 150,
    lastRestocked: new Date('2024-01-08'),
    supplier: 'ABC Supplies',
  },
  {
    id: '4',
    name: 'Poly Bags (Large)',
    category: 'packaging',
    currentStock: 500,
    minStock: 200,
    unit: 'pieces',
    costPerUnit: 2,
    lastRestocked: new Date('2024-01-12'),
    supplier: 'Packaging Co.',
  },
  {
    id: '5',
    name: 'Hangers (Premium)',
    category: 'packaging',
    currentStock: 150,
    minStock: 100,
    unit: 'pieces',
    costPerUnit: 5,
    lastRestocked: new Date('2024-01-14'),
    supplier: 'Packaging Co.',
  },
  {
    id: '6',
    name: 'Washing Machine Belt',
    category: 'equipment',
    currentStock: 3,
    minStock: 5,
    unit: 'pieces',
    costPerUnit: 450,
    lastRestocked: new Date('2023-12-20'),
    supplier: 'Equipment Hub',
  },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories', icon: Boxes },
  { value: 'detergent', label: 'Detergent', icon: Box },
  { value: 'softener', label: 'Softener', icon: Box },
  { value: 'bleach', label: 'Bleach', icon: Box },
  { value: 'packaging', label: 'Packaging', icon: Package },
  { value: 'equipment', label: 'Equipment', icon: Package },
] as const;

type CategoryType = 'all' | InventoryItem['category'];

const CATEGORY_COLORS: Record<InventoryItem['category'], string> = {
  detergent: 'bg-blue-50 text-blue-700 border-blue-200',
  softener: 'bg-purple-50 text-purple-700 border-purple-200',
  bleach: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  packaging: 'bg-green-50 text-green-700 border-green-200',
  equipment: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const filteredItems = useMemo(() => {
    return MOCK_INVENTORY.filter((item) => {
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesLowStock = !showLowStockOnly || item.currentStock <= item.minStock;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [searchQuery, categoryFilter, showLowStockOnly]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all' || showLowStockOnly;
  
  const lowStockCount = MOCK_INVENTORY.filter(item => item.currentStock <= item.minStock).length;
  const totalValue = MOCK_INVENTORY.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setShowLowStockOnly(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const currentCategory = CATEGORY_OPTIONS.find(opt => opt.value === categoryFilter);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsCategoryOpen(false);
    if (isCategoryOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isCategoryOpen]);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="border-b border-slate-200">
        <div className="px-4 lg:px-6 py-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Inventory</h1>
              <p className="text-sm text-slate-500">Manage supplies and stock levels</p>
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
                onClick={() => console.log('Add Item')}
                className={cn(
                  'h-11 flex items-center justify-center px-5 gap-2 rounded-full transition-all duration-200',
                  'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm'
                )}
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
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
                  placeholder="Search items or suppliers..."
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

            {/* Category Dropdown */}
            <div className="relative w-full sm:w-52">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCategoryOpen(!isCategoryOpen);
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
                      {CATEGORY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
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
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{option.label}</span>
                            </div>
                            {categoryFilter === option.value && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Low Stock Toggle */}
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={cn(
                'h-11 flex items-center justify-center px-5 gap-2 rounded-full border transition-all duration-200 font-medium text-sm',
                showLowStockOnly
                  ? 'bg-red-600 border-red-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-600'
              )}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Low Stock</span>
            </button>

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
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Showing <span className="font-semibold">{filteredItems.length}</span> of{' '}
                    <span className="font-semibold">{MOCK_INVENTORY.length}</span> items
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200">
                <Package className="w-9 h-9 text-slate-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                <Search className="w-3 h-3 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No items found</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
              We couldn't find any inventory items matching your filters. Try adjusting your search.
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
                        Item Name
                      </th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Stock Status
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Cost/Unit
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Total Value
                      </th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Last Restocked
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => {
                      const isLowStock = item.currentStock <= item.minStock;
                      const stockPercentage = (item.currentStock / item.minStock) * 100;
                      
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Item Name */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                CATEGORY_COLORS[item.category]
                              )}>
                                <Package className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  SKU: {item.id.toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-5">
                            <span className={cn(
                              "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border",
                              CATEGORY_COLORS[item.category]
                            )}>
                              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            </span>
                          </td>

                          {/* Stock Status */}
                          <td className="py-4 px-5">
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "font-bold text-lg",
                                  isLowStock ? "text-red-600" : "text-slate-900"
                                )}>
                                  {item.currentStock}
                                </span>
                                <span className="text-sm text-slate-500">/ {item.minStock} {item.unit}</span>
                              </div>
                              <div className="w-full max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    isLowStock ? "bg-red-500" : "bg-green-500"
                                  )}
                                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                />
                              </div>
                              {isLowStock && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Cost/Unit */}
                          <td className="py-4 px-5">
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-slate-900 flex items-center gap-0.5">
                                <IndianRupee className="w-3.5 h-3.5" />
                                {item.costPerUnit}
                              </span>
                              <span className="text-xs text-slate-500">per {item.unit}</span>
                            </div>
                          </td>

                          {/* Total Value */}
                          <td className="py-4 px-5">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-slate-900 flex items-center gap-0.5">
                                <IndianRupee className="w-4 h-4" />
                                {(item.currentStock * item.costPerUnit).toLocaleString()}
                              </span>
                            </div>
                          </td>

                          {/* Supplier */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-semibold text-slate-600">
                                  {item.supplier.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-slate-700">
                                {item.supplier}
                              </span>
                            </div>
                          </td>

                          {/* Last Restocked */}
                          <td className="py-4 px-5">
                            <div className="flex flex-col items-center">
                              <span className="font-medium text-slate-900 text-sm">
                                {formatDate(item.lastRestocked)}
                              </span>
                              <span className="text-xs text-slate-500 mt-0.5">
                                {Math.floor((new Date().getTime() - item.lastRestocked.getTime()) / (1000 * 60 * 60 * 24))} days ago
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
                                    Edit Item
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Restock
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this item?')) {
                                        console.log('Delete', item.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Item
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
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filteredItems.map((item) => {
                const isLowStock = item.currentStock <= item.minStock;
                const stockPercentage = (item.currentStock / item.minStock) * 100;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                  >
                    {/* Card Header */}
                    <div className={cn(
                      "px-4 py-3 border-b",
                      isLowStock 
                        ? "bg-gradient-to-r from-red-50 to-red-100/30 border-red-100"
                        : "bg-gradient-to-r from-blue-50 to-blue-100/30 border-blue-100"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            CATEGORY_COLORS[item.category]
                          )}>
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                                CATEGORY_COLORS[item.category]
                              )}>
                                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                              </span>
                              {isLowStock && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  Low
                                </span>
                              )}
                            </div>
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
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Plus className="w-4 h-4 mr-2" />
                              Restock
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
                      {/* Stock Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Current Stock</span>
                          <span className={cn(
                            "font-bold text-lg",
                            isLowStock ? "text-red-600" : "text-slate-900"
                          )}>
                            {item.currentStock} / {item.minStock} {item.unit}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              isLowStock ? "bg-red-500" : "bg-green-500"
                            )}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Cost/Unit</p>
                          <p className="font-bold text-lg text-slate-900 flex items-center gap-0.5">
                            <IndianRupee className="w-4 h-4" />
                            {item.costPerUnit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Total Value</p>
                          <p className="font-bold text-lg text-slate-900 flex items-center gap-0.5">
                            <IndianRupee className="w-4 h-4" />
                            {(item.currentStock * item.costPerUnit).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2 pt-4 border-t border-slate-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Supplier:</span>
                          <span className="font-medium text-slate-900">{item.supplier}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Last restocked:</span>
                          <span className="font-medium text-slate-900">{formatDate(item.lastRestocked)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}