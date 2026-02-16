// app/(dashboard)/inventory/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, X, FilterX, Edit, Trash2,
  MoreVertical, ChevronDown, Check, Package, AlertTriangle,
  Box, Boxes, IndianRupee, Loader2,
  ArrowUpCircle, ArrowDownCircle, Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  useInventory,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useRestockInventoryItem,
  useAdjustInventoryStock,
  type InventoryItemWithStats,
  type InventoryFilters,
} from '@/app/hooks/use-inventory';
import {
  type InventoryCategory,
  type AdjustmentReason,
  INVENTORY_CATEGORY_CONFIG,
  ADJUSTMENT_REASON_CONFIG,
} from '@/app/types/inventory';

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories', icon: Boxes },
  { value: 'DETERGENT', label: 'Detergent', icon: Box },
  { value: 'SOFTENER', label: 'Softener', icon: Box },
  { value: 'BLEACH', label: 'Bleach', icon: Box },
  { value: 'PACKAGING', label: 'Packaging', icon: Package },
  { value: 'EQUIPMENT', label: 'Equipment', icon: Package },
  { value: 'CHEMICALS', label: 'Chemicals', icon: Box },
  { value: 'ACCESSORIES', label: 'Accessories', icon: Box },
  { value: 'OTHER', label: 'Other', icon: Box },
] as const;

type CategoryFilterType = 'all' | InventoryCategory;

const ADJUSTMENT_REASONS: { value: AdjustmentReason; label: string; description: string }[] = [
  { value: 'COUNT_CORRECTION', label: 'Count Correction', description: 'Physical count differs from system' },
  { value: 'DAMAGED', label: 'Damaged', description: 'Items damaged and cannot be used' },
  { value: 'EXPIRED', label: 'Expired', description: 'Items past expiration date' },
  { value: 'LOST', label: 'Lost', description: 'Items cannot be located' },
  { value: 'STOLEN', label: 'Stolen', description: 'Items suspected stolen' },
  { value: 'RETURN_TO_SUPPLIER', label: 'Return to Supplier', description: 'Items returned to vendor' },
  { value: 'INTERNAL_USE', label: 'Internal Use', description: 'Used internally, not sold' },
  { value: 'SAMPLE', label: 'Sample/Demo', description: 'Given as samples or demos' },
  { value: 'OTHER', label: 'Other', description: 'Other reason' },
];

const initialFormData = {
  name: '',
  description: '',
  sku: '',
  category: 'OTHER' as InventoryCategory,
  currentStock: 0,
  minStock: 10,
  maxStock: null as number | null,
  unit: 'pieces',
  costPerUnit: 0,
  supplier: '',
  supplierPhone: '',
  supplierEmail: '',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Never';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

function getCategoryColor(category: InventoryCategory): string {
  const config = INVENTORY_CATEGORY_CONFIG[category];
  return `${config.bgColor} ${config.color} ${config.borderColor}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InventoryPage() {
  // ============= State =============
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>('all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemWithStats | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItemWithStats | null>(null);
  const [restockingItem, setRestockingItem] = useState<InventoryItemWithStats | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItemWithStats | null>(null);

  // Form States
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [restockAmount, setRestockAmount] = useState(0);
  const [restockNotes, setRestockNotes] = useState('');

  // Adjustment Form States
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'REMOVE'>('REMOVE');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState<AdjustmentReason>('COUNT_CORRECTION');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  // ============= Debounce Search =============
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ============= Query Filters =============
  const filters: InventoryFilters = {
    search: debouncedSearch,
    category: categoryFilter,
    lowStockOnly: showLowStockOnly,
    limit: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  };

  // ============= React Query Hooks =============
  const { data: inventoryData, isLoading, isError, error, refetch } = useInventory(filters);
  const { mutateAsync: createItem, isPending: isCreating } = useCreateInventoryItem();
  const { mutateAsync: updateItem, isPending: isUpdating } = useUpdateInventoryItem();
  const { mutateAsync: deleteItem, isPending: isDeleting } = useDeleteInventoryItem();
  const { mutateAsync: restockItem, isPending: isRestocking } = useRestockInventoryItem();
  const { mutateAsync: adjustStock, isPending: isAdjusting } = useAdjustInventoryStock();

  const items = inventoryData?.data ?? [];
  const pagination = inventoryData?.pagination;

  // ============= Computed Values =============
  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all' || showLowStockOnly;
  const lowStockCount = items.filter((item) => item.isLowStock).length;
  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);

  // ============= Load Edit Form =============
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description ?? '',
        sku: editingItem.sku ?? '',
        category: editingItem.category,
        currentStock: editingItem.currentStock,
        minStock: editingItem.minStock,
        maxStock: editingItem.maxStock ?? null,
        unit: editingItem.unit,
        costPerUnit: editingItem.costPerUnit,
        supplier: editingItem.supplier ?? '',
        supplierPhone: editingItem.supplierPhone ?? '',
        supplierEmail: editingItem.supplierEmail ?? '',
      });
      setFormErrors({});
    }
  }, [editingItem]);

  // ============= Reset Form =============
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setFormErrors({});
  }, []);

  useEffect(() => {
    if (!isCreateOpen) {
      resetForm();
    }
  }, [isCreateOpen, resetForm]);

  // Reset adjustment form when dialog closes
  useEffect(() => {
    if (!adjustingItem) {
      setAdjustmentType('REMOVE');
      setAdjustmentQuantity(0);
      setAdjustmentReason('COUNT_CORRECTION');
      setAdjustmentNotes('');
    }
  }, [adjustingItem]);

  // ============= Validation =============
  const validateForm = useCallback((isEdit = false): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!isEdit && formData.currentStock < 0) {
      errors.currentStock = 'Stock cannot be negative';
    }

    if (formData.minStock < 0) {
      errors.minStock = 'Min stock cannot be negative';
    }

    if (formData.costPerUnit < 0) {
      errors.costPerUnit = 'Cost cannot be negative';
    }

    if (!formData.unit.trim()) {
      errors.unit = 'Unit is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // ============= Handlers =============
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setCategoryFilter('all');
    setShowLowStockOnly(false);
  }, []);

  const handleInputChange = useCallback((field: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const handleCreateSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createItem({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        sku: formData.sku.trim() || null,
        category: formData.category,
        currentStock: formData.currentStock,
        minStock: formData.minStock,
        maxStock: formData.maxStock ?? null,
        unit: formData.unit.trim(),
        costPerUnit: formData.costPerUnit,
        supplier: formData.supplier.trim() || null,
        supplierPhone: formData.supplierPhone.trim() || null,
        supplierEmail: formData.supplierEmail.trim() || null,
      });
      setIsCreateOpen(false);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleEditSubmit = async () => {
    if (!editingItem || !validateForm(true)) return;

    try {
      await updateItem({
        id: editingItem.id,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          sku: formData.sku.trim() || null,
          category: formData.category,
          minStock: formData.minStock,
          maxStock: formData.maxStock ?? null,
          unit: formData.unit.trim(),
          costPerUnit: formData.costPerUnit,
          supplier: formData.supplier.trim() || null,
          supplierPhone: formData.supplierPhone.trim() || null,
          supplierEmail: formData.supplierEmail.trim() || null,
        },
      });
      setEditingItem(null);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteItem(deletingItem.id);
      setDeletingItem(null);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleRestock = async () => {
    if (!restockingItem || restockAmount <= 0) return;

    try {
      await restockItem({
        id: restockingItem.id,
        data: {
          addedStock: restockAmount,
          notes: restockNotes.trim() || undefined,
        },
      });
      setRestockingItem(null);
      setRestockAmount(0);
      setRestockNotes('');
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustingItem || adjustmentQuantity <= 0) return;

    try {
      await adjustStock({
        id: adjustingItem.id,
        data: {
          type: adjustmentType,
          quantity: adjustmentQuantity,
          reason: adjustmentReason,
          notes: adjustmentNotes.trim() || undefined,
        },
      });
      setAdjustingItem(null);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const currentCategory = CATEGORY_OPTIONS.find((opt) => opt.value === categoryFilter);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsCategoryOpen(false);
    if (isCategoryOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isCategoryOpen]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="border-b border-slate-200">
        <div className="px-4 lg:px-6 py-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Inventory</h1>
              <p className="text-sm text-slate-500">
                Manage supplies and stock levels
                {items.length > 0 && (
                  <span className="ml-2 text-slate-400">
                    • Total Value: ₹{totalValue.toLocaleString('en-IN')}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className={cn(
                'h-11 flex items-center justify-center px-5 gap-2 rounded-full transition-all duration-200',
                'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm'
              )}
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
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
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
                    isCategoryOpen && 'rotate-180'
                  )}
                />
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
                    <div className="p-1.5 max-h-64 overflow-y-auto">
                      {CATEGORY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
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
              {lowStockCount > 0 && !showLowStockOnly && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                  {lowStockCount}
                </span>
              )}
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
                    Showing <span className="font-semibold">{items.length}</span> of{' '}
                    <span className="font-semibold">{pagination?.total ?? items.length}</span> items
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load inventory</h3>
            <p className="text-sm text-slate-500 mb-4">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="rounded-full">
              Try Again
            </Button>
          </div>
        ) : items.length === 0 ? (
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {hasActiveFilters ? 'No items found' : 'No inventory items yet'}
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
              {hasActiveFilters
                ? "We couldn't find any inventory items matching your filters. Try adjusting your search."
                : 'Start by adding your first inventory item to track stock levels.'}
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
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="rounded-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            )}
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
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border',
                                getCategoryColor(item.category)
                              )}
                            >
                              <Package className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                SKU: {item.sku ?? item.id.slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span
                            className={cn(
                              'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border',
                              getCategoryColor(item.category)
                            )}
                          >
                            {INVENTORY_CATEGORY_CONFIG[item.category].label}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'font-bold text-lg',
                                  item.isLowStock ? 'text-red-600' : 'text-slate-900'
                                )}
                              >
                                {item.currentStock}
                              </span>
                              <span className="text-sm text-slate-500">
                                / {item.minStock} {item.unit}
                              </span>
                            </div>
                            <div className="w-full max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  item.isLowStock ? 'bg-red-500' : 'bg-green-500'
                                )}
                                style={{ width: `${Math.min(item.stockPercentage, 100)}%` }}
                              />
                            </div>
                            {item.isLowStock && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-slate-900 flex items-center gap-0.5">
                              <IndianRupee className="w-3.5 h-3.5" />
                              {item.costPerUnit.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-slate-500">per {item.unit}</span>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-900 flex items-center gap-0.5">
                              <IndianRupee className="w-4 h-4" />
                              {item.totalValue.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          {item.supplier ? (
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
                          ) : (
                            <span className="text-sm text-slate-400 italic">Not set</span>
                          )}
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex flex-col items-center">
                            <span className="font-medium text-slate-900 text-sm">
                              {formatDate(item.lastRestockedAt)}
                            </span>
                            {item.daysSinceRestock !== undefined && item.daysSinceRestock >= 0 && (
                              <span className="text-xs text-slate-500 mt-0.5">
                                {item.daysSinceRestock} days ago
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-slate-100"
                                >
                                  <MoreVertical className="w-4 h-4 text-slate-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 bg-white border border-slate-200 shadow-lg"
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => setEditingItem(item)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Item
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => setRestockingItem(item)}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Restock
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => setAdjustingItem(item)}
                                >
                                  <Settings2 className="w-4 h-4 mr-2" />
                                  Adjust Stock
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                  onClick={() => setDeletingItem(item)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Item
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
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div
                    className={cn(
                      'px-4 py-3 border-b',
                      item.isLowStock
                        ? 'bg-gradient-to-r from-red-50 to-red-100/30 border-red-100'
                        : 'bg-gradient-to-r from-blue-50 to-blue-100/30 border-blue-100'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center border',
                            getCategoryColor(item.category)
                          )}
                        >
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                                getCategoryColor(item.category)
                              )}
                            >
                              {INVENTORY_CATEGORY_CONFIG[item.category].label}
                            </span>
                            {item.isLowStock && (
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
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-white border border-slate-200 shadow-lg"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setEditingItem(item)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setRestockingItem(item)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Restock
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setAdjustingItem(item)}
                          >
                            <Settings2 className="w-4 h-4 mr-2" />
                            Adjust Stock
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={() => setDeletingItem(item)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Current Stock</span>
                        <span
                          className={cn(
                            'font-bold text-lg',
                            item.isLowStock ? 'text-red-600' : 'text-slate-900'
                          )}
                        >
                          {item.currentStock} / {item.minStock} {item.unit}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            item.isLowStock ? 'bg-red-500' : 'bg-green-500'
                          )}
                          style={{ width: `${Math.min(item.stockPercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Cost/Unit</p>
                        <p className="font-bold text-lg text-slate-900 flex items-center gap-0.5">
                          <IndianRupee className="w-4 h-4" />
                          {item.costPerUnit.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Total Value</p>
                        <p className="font-bold text-lg text-slate-900 flex items-center gap-0.5">
                          <IndianRupee className="w-4 h-4" />
                          {item.totalValue.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Supplier:</span>
                        <span className="font-medium text-slate-900">
                          {item.supplier ?? 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Last restocked:</span>
                        <span className="font-medium text-slate-900">
                          {formatDate(item.lastRestockedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ============= CREATE/EDIT DIALOG ============= */}
      <Dialog
        open={isCreateOpen || !!editingItem}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingItem(null);
          }
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Update inventory item details. To change stock levels, use Restock or Adjust Stock.'
                : 'Add a new item to your inventory'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Tide Detergent"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={cn(formErrors.name && 'border-red-300')}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="Auto-generated if empty"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INVENTORY_CATEGORY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unit"
                  placeholder="e.g. kg, liters, pieces"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className={cn(formErrors.unit && 'border-red-300')}
                />
                {formErrors.unit && (
                  <p className="text-xs text-red-600">{formErrors.unit}</p>
                )}
              </div>
            </div>

            <div className={cn('grid gap-4', editingItem ? 'grid-cols-2' : 'grid-cols-3')}>
              {!editingItem && (
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Initial Stock</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange('currentStock', parseInt(e.target.value) || 0)}
                    className={cn(formErrors.currentStock && 'border-red-300')}
                  />
                  {formErrors.currentStock && (
                    <p className="text-xs text-red-600">{formErrors.currentStock}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                  className={cn(formErrors.minStock && 'border-red-300')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerUnit">Cost/Unit (₹)</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => handleInputChange('costPerUnit', parseFloat(e.target.value) || 0)}
                  className={cn(formErrors.costPerUnit && 'border-red-300')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier Name</Label>
              <Input
                id="supplier"
                placeholder="e.g. ABC Supplies"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingItem(null);
              }}
              disabled={isCreating || isUpdating}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={editingItem ? handleEditSubmit : handleCreateSubmit}
              disabled={isCreating || isUpdating}
              className="rounded-full bg-blue-600 hover:bg-blue-700"
            >
              {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingItem ? 'Update Item' : 'Create Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============= RESTOCK DIALOG ============= */}
      <Dialog open={!!restockingItem} onOpenChange={(open) => !open && setRestockingItem(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Restock Item
            </DialogTitle>
            <DialogDescription>
              Add new stock received from supplier for <strong>{restockingItem?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Current Stock:</span>
                <span className="font-semibold">
                  {restockingItem?.currentStock} {restockingItem?.unit}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restockAmount">
                Add Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="restockAmount"
                type="number"
                min="1"
                placeholder="Enter quantity to add"
                value={restockAmount || ''}
                onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restockNotes">Notes</Label>
              <Textarea
                id="restockNotes"
                placeholder="e.g. Received from ABC Supplies, Invoice #123"
                value={restockNotes}
                onChange={(e) => setRestockNotes(e.target.value)}
                rows={2}
              />
            </div>

            {restockAmount > 0 && restockingItem && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">New Stock:</span>
                  <span className="font-bold text-green-800">
                    {restockingItem.currentStock + restockAmount} {restockingItem.unit}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestockingItem(null);
                setRestockAmount(0);
                setRestockNotes('');
              }}
              disabled={isRestocking}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRestock}
              disabled={isRestocking || restockAmount <= 0}
              className="rounded-full bg-green-600 hover:bg-green-700"
            >
              {isRestocking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============= STOCK ADJUSTMENT DIALOG ============= */}
      <Dialog open={!!adjustingItem} onOpenChange={(open) => !open && setAdjustingItem(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-blue-600" />
              Adjust Stock
            </DialogTitle>
            <DialogDescription>
              Add or remove stock for <strong>{adjustingItem?.name}</strong> with a reason for tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Stock Info */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Current Stock</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-2xl font-bold",
                    adjustingItem?.isLowStock ? "text-red-600" : "text-slate-900"
                  )}>
                    {adjustingItem?.currentStock}
                  </span>
                  <span className="text-sm text-slate-500">{adjustingItem?.unit}</span>
                </div>
              </div>
              {adjustingItem?.isLowStock && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Below minimum stock level ({adjustingItem.minStock})
                </div>
              )}
            </div>

            {/* Adjustment Type Toggle */}
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('ADD')}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                    adjustmentType === 'ADD'
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <ArrowUpCircle className="w-5 h-5" />
                  <span className="font-medium">Add Stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('REMOVE')}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                    adjustmentType === 'REMOVE'
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <ArrowDownCircle className="w-5 h-5" />
                  <span className="font-medium">Remove Stock</span>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="adjustmentQuantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="adjustmentQuantity"
                type="number"
                min="1"
                max={adjustmentType === 'REMOVE' ? adjustingItem?.currentStock : undefined}
                placeholder={`Enter ${adjustingItem?.unit} to ${adjustmentType.toLowerCase()}`}
                value={adjustmentQuantity || ''}
                onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                className={cn(
                  "text-lg h-12",
                  adjustmentType === 'REMOVE' && adjustmentQuantity > (adjustingItem?.currentStock || 0)
                    ? "border-red-300 focus:border-red-500"
                    : ""
                )}
              />
              {adjustmentType === 'REMOVE' && adjustmentQuantity > (adjustingItem?.currentStock || 0) && (
                <p className="text-xs text-red-600">
                  Cannot remove more than available stock ({adjustingItem?.currentStock} {adjustingItem?.unit})
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>
                Reason <span className="text-red-500">*</span>
              </Label>
              <Select
                value={adjustmentReason}
                onValueChange={(value) => setAdjustmentReason(value as AdjustmentReason)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{reason.label}</span>
                        <span className="text-xs text-slate-500">{reason.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="adjustmentNotes">Notes (Optional)</Label>
              <Textarea
                id="adjustmentNotes"
                placeholder="Add any additional details..."
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Preview */}
            {adjustmentQuantity > 0 && adjustingItem && (
              <div className={cn(
                "p-4 rounded-xl border",
                adjustmentType === 'ADD'
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              )}>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm font-medium",
                    adjustmentType === 'ADD' ? "text-green-700" : "text-red-700"
                  )}>
                    New Stock After Adjustment
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 line-through">
                      {adjustingItem.currentStock}
                    </span>
                    <span className="text-lg font-bold">
                      →
                    </span>
                    <span className={cn(
                      "text-2xl font-bold",
                      adjustmentType === 'ADD' ? "text-green-700" : "text-red-700"
                    )}>
                      {adjustmentType === 'ADD'
                        ? adjustingItem.currentStock + adjustmentQuantity
                        : Math.max(0, adjustingItem.currentStock - adjustmentQuantity)}
                    </span>
                    <span className="text-sm text-slate-500">{adjustingItem.unit}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustingItem(null)}
              disabled={isAdjusting}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustStock}
              disabled={
                isAdjusting || 
                adjustmentQuantity <= 0 ||
                (adjustmentType === 'REMOVE' && adjustmentQuantity > (adjustingItem?.currentStock || 0))
              }
              className={cn(
                "rounded-full",
                adjustmentType === 'ADD'
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              {isAdjusting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {adjustmentType === 'ADD' ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============= DELETE DIALOG ============= */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inventory Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingItem?.name}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}