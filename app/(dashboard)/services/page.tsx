'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, X, Download, FilterX, Edit, Trash2, 
  MoreVertical, ChevronDown, Check, Clock, Zap, 
  ToggleLeft, ToggleRight, Shirt, Home, Sparkles, Grid3X3, List
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

interface ServiceItem {
  id: string;
  name: string;
  category: 'garment' | 'household' | 'specialty';
  services: string[];
  basePrice: number;
  expressPrice: number;
  estimatedTime: string;
  isActive: boolean;
}

const MOCK_SERVICES: ServiceItem[] = [
  {
    id: '1',
    name: 'Shirt',
    category: 'garment',
    services: ['Wash & Iron', 'Dry Clean', 'Iron Only'],
    basePrice: 40,
    expressPrice: 60,
    estimatedTime: '24 hours',
    isActive: true,
  },
  {
    id: '2',
    name: 'Trouser',
    category: 'garment',
    services: ['Wash & Iron', 'Dry Clean', 'Iron Only'],
    basePrice: 50,
    expressPrice: 75,
    estimatedTime: '24 hours',
    isActive: true,
  },
  {
    id: '3',
    name: 'Saree',
    category: 'garment',
    services: ['Dry Clean', 'Wash & Starch', 'Iron Only'],
    basePrice: 150,
    expressPrice: 225,
    estimatedTime: '48 hours',
    isActive: true,
  },
  {
    id: '4',
    name: 'Suit (2-piece)',
    category: 'garment',
    services: ['Dry Clean', 'Steam Press'],
    basePrice: 300,
    expressPrice: 450,
    estimatedTime: '48 hours',
    isActive: true,
  },
  {
    id: '5',
    name: 'Bedsheet (Double)',
    category: 'household',
    services: ['Wash & Iron', 'Dry Clean'],
    basePrice: 80,
    expressPrice: 120,
    estimatedTime: '24 hours',
    isActive: true,
  },
  {
    id: '6',
    name: 'Curtain (per panel)',
    category: 'household',
    services: ['Dry Clean', 'Wash & Iron'],
    basePrice: 120,
    expressPrice: 180,
    estimatedTime: '48 hours',
    isActive: true,
  },
  {
    id: '7',
    name: 'Wedding Dress',
    category: 'specialty',
    services: ['Dry Clean', 'Special Care'],
    basePrice: 800,
    expressPrice: 1200,
    estimatedTime: '72 hours',
    isActive: true,
  },
  {
    id: '8',
    name: 'Leather Jacket',
    category: 'specialty',
    services: ['Dry Clean', 'Conditioning'],
    basePrice: 500,
    expressPrice: 750,
    estimatedTime: '72 hours',
    isActive: false,
  },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'garment', label: 'Garments' },
  { value: 'household', label: 'Household' },
  { value: 'specialty', label: 'Specialty' },
] as const;

type CategoryType = 'all' | ServiceItem['category'];

const CATEGORY_CONFIG: Record<ServiceItem['category'], { 
  label: string; 
  icon: any; 
  color: string; 
  bg: string;
  lightBg: string;
}> = {
  garment: { 
    label: 'Garments', 
    icon: Shirt, 
    color: 'text-blue-600', 
    bg: 'bg-blue-600',
    lightBg: 'bg-blue-50'
  },
  household: { 
    label: 'Household', 
    icon: Home, 
    color: 'text-purple-600', 
    bg: 'bg-purple-600',
    lightBg: 'bg-purple-50'
  },
  specialty: { 
    label: 'Specialty', 
    icon: Sparkles, 
    color: 'text-orange-600', 
    bg: 'bg-orange-600',
    lightBg: 'bg-orange-50'
  },
};

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const filteredServices = useMemo(() => {
    return MOCK_SERVICES.filter((service) => {
      const matchesSearch = searchQuery === '' || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
      const matchesActive = !showActiveOnly || service.isActive;

      return matchesSearch && matchesCategory && matchesActive;
    });
  }, [searchQuery, categoryFilter, showActiveOnly]);

  // Group services by category
  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceItem[]> = {};
    
    filteredServices.forEach((service) => {
      if (!groups[service.category]) {
        groups[service.category] = [];
      }
      groups[service.category].push(service);
    });
    
    // Sort categories: garment, household, specialty
    const order = ['garment', 'household', 'specialty'];
    const sorted: Record<string, ServiceItem[]> = {};
    order.forEach(cat => {
      if (groups[cat]) {
        sorted[cat] = groups[cat].sort((a, b) => a.basePrice - b.basePrice);
      }
    });
    
    return sorted;
  }, [filteredServices]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all' || showActiveOnly;
  const activeCount = MOCK_SERVICES.filter(s => s.isActive).length;

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setShowActiveOnly(false);
  };

  const currentCategory = CATEGORY_OPTIONS.find(opt => opt.value === categoryFilter);

  // Close dropdowns when clicking outside
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
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Services</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">Manage pricing and service options</span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">
                  {activeCount}/{MOCK_SERVICES.length} active
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
                onClick={() => console.log('Add Service')}
                className={cn(
                  'h-11 flex items-center justify-center px-5 gap-2 rounded-full transition-all duration-200',
                  'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm'
                )}
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
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
                  placeholder="Search services..."
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
            <div className="relative w-full sm:w-48">
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

            {/* Active Only Toggle */}
            <button
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={cn(
                'h-11 flex items-center justify-center px-5 gap-2 rounded-full border transition-all duration-200 font-medium text-sm whitespace-nowrap',
                showActiveOnly
                  ? 'bg-green-600 border-green-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 hover:border-green-200 hover:bg-green-50 hover:text-green-600 text-slate-600'
              )}
            >
              {showActiveOnly ? (
                <ToggleRight className="w-4 h-4 shrink-0" />
              ) : (
                <ToggleLeft className="w-4 h-4 shrink-0" />
              )}
              <span className="hidden sm:inline">Active Only</span>
              <span className="sm:hidden">Active</span>
            </button>

            {/* View Mode Toggle - Desktop Only */}
            <div className="hidden lg:flex h-11 rounded-full border border-slate-200 bg-white p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'h-full px-3 rounded-full flex items-center gap-1.5 transition-all duration-200 text-sm font-medium',
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-full px-3 rounded-full flex items-center gap-1.5 transition-all duration-200 text-sm font-medium',
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
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
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-full border border-slate-100 w-fit">
                  <Shirt className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{filteredServices.length}</span> services found
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        {filteredServices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200">
                <Shirt className="w-9 h-9 text-slate-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                <Search className="w-3 h-3 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No services found</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
              We couldn't find any services matching your filters. Try adjusting your search.
            </p>
            <button
              onClick={handleClearFilters}
              className="h-10 px-5 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2"
            >
              <FilterX className="w-4 h-4" />
              Clear All Filters
            </button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, services]) => {
              const config = CATEGORY_CONFIG[category as ServiceItem['category']];
              const CategoryIcon = config.icon;
              
              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
                      <CategoryIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900">{config.label}</h2>
                      <p className="text-xs text-slate-500">{services.length} services</p>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={cn(
                          "bg-white border rounded-2xl p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300",
                          !service.isActive && "opacity-60"
                        )}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{service.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{service.estimatedTime}</span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 -mr-1 -mt-1">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 bg-white border border-slate-200 shadow-lg">
                              <DropdownMenuItem className="cursor-pointer text-sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer text-sm">
                                {service.isActive ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                                {service.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer text-sm">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Services Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {service.services.slice(0, 2).map((s, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                          {service.services.length > 2 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              +{service.services.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Pricing */}
                        <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Base</p>
                            <p className="font-bold text-lg text-slate-900">₹{service.basePrice}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-blue-600 mb-0.5 flex items-center justify-end gap-0.5">
                              <Zap className="w-3 h-3" />
                              Express
                            </p>
                            <p className="font-bold text-lg text-blue-600">₹{service.expressPrice}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {!service.isActive && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                              Inactive
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View - Grouped by Category */
          <div className="space-y-6">
            {Object.entries(groupedServices).map(([category, services]) => {
              const config = CATEGORY_CONFIG[category as ServiceItem['category']];
              const CategoryIcon = config.icon;
              
              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
                        <CategoryIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-slate-900">{config.label}</h2>
                        <p className="text-xs text-slate-500">{services.length} services</p>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-100">
                        {services.map((service) => (
                          <tr
                            key={service.id}
                            className={cn(
                              "hover:bg-slate-50/70 transition-colors",
                              !service.isActive && "opacity-60"
                            )}
                          >
                            {/* Service Name */}
                            <td className="py-4 px-5 w-[25%]">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium text-slate-900">{service.name}</p>
                                  {!service.isActive && (
                                    <span className="text-xs text-slate-400">Inactive</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Services */}
                            <td className="py-4 px-5 w-[30%]">
                              <div className="flex flex-wrap gap-1.5">
                                {service.services.map((s, i) => (
                                  <span
                                    key={i}
                                    className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Time */}
                            <td className="py-4 px-5 w-[15%]">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">{service.estimatedTime}</span>
                              </div>
                            </td>

                            {/* Base Price */}
                            <td className="py-4 px-5 w-[10%] text-right">
                              <span className="font-semibold text-slate-900">₹{service.basePrice}</span>
                            </td>

                            {/* Express Price */}
                            <td className="py-4 px-5 w-[12%] text-right">
                              <div className="inline-flex items-center gap-1 text-blue-600">
                                <Zap className="w-3 h-3" />
                                <span className="font-semibold">₹{service.expressPrice}</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5 w-[8%]">
                              <div className="flex items-center justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                                      <MoreVertical className="w-4 h-4 text-slate-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44 bg-white border border-slate-200 shadow-lg">
                                    <DropdownMenuItem className="cursor-pointer text-sm">
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Service
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer text-sm">
                                      {service.isActive ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                                      {service.isActive ? 'Deactivate' : 'Activate'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer text-sm">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
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

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-2">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={cn(
                          "bg-white border border-slate-200 rounded-xl p-4 shadow-sm",
                          !service.isActive && "opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-slate-900">{service.name}</h3>
                              {!service.isActive && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>{service.estimatedTime}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {service.services.map((s, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-semibold text-slate-900">₹{service.basePrice}</span>
                            <div className="flex items-center gap-0.5 text-blue-600">
                              <Zap className="w-3 h-3" />
                              <span className="text-sm font-semibold">₹{service.expressPrice}</span>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 bg-white border border-slate-200 shadow-lg">
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
                    ))}
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