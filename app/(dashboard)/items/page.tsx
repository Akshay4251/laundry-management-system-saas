//app/(dashboard)/items/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Plus,
    X,
    FilterX,
    Edit,
    Trash2,
    MoreVertical,
    Loader2,
    Package,
    SlidersHorizontal,
    ChevronDown,
    Check,
    Shirt,
    Home,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    useItems,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
    useToggleItem,
} from '@/app/hooks/use-items';
import type { Item, ItemCategory, CreateItemInput, UpdateItemInput } from '@/app/types/item';
import type { Service } from '@/app/types/service';
import { ServiceIconDisplay } from '@/components/services/service-icon-display';
import { ServiceIconPicker } from '@/components/services/service-icon-picker';

// ============================================================================
// CONSTANTS
// ============================================================================

type CategoryFilter = 'all' | ItemCategory;

const CATEGORIES = [
    {
        id: 'GARMENT' as const,
        label: 'Garments',
        icon: Shirt,
        color: 'text-blue-600',
        bg: 'bg-blue-600',
        description: 'Shirts, Pants, Dresses',
    },
    {
        id: 'HOUSEHOLD' as const,
        label: 'Household',
        icon: Home,
        color: 'text-purple-600',
        bg: 'bg-purple-600',
        description: 'Bedsheets, Curtains, Towels',
    },
    {
        id: 'SPECIALTY' as const,
        label: 'Specialty',
        icon: Sparkles,
        color: 'text-orange-600',
        bg: 'bg-orange-600',
        description: 'Premium, Wedding, Leather',
    },
];

// ============================================================================
// ITEM FORM MODAL (Create/Edit)
// ============================================================================

interface ItemFormModalProps {
    open: boolean;
    onClose: () => void;
    item: Item | null;
    services: Service[];
}

function ItemFormModal({ open, onClose, item, services }: ItemFormModalProps) {
    const isEditing = !!item;
    const createItem = useCreateItem();
    const updateItem = useUpdateItem();

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        category: ItemCategory;
        iconUrl: string | null;
        isActive: boolean;
        sortOrder: number;
        prices: {
            serviceId: string;
            price: number | null;
            expressPrice: number | null;
            isAvailable: boolean;
            useAuto: boolean;
        }[];
    }>({
        name: '',
        description: '',
        category: 'GARMENT',
        iconUrl: null,
        isActive: true,
        sortOrder: 0,
        prices: [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isUploadingIcon, setIsUploadingIcon] = useState(false);

    // Initialize form data
    useEffect(() => {
        if (open) {
            if (item) {
                // Edit mode - populate existing data
                const pricesMap = new Map(
                    item.prices?.map((p) => [
                        p.serviceId,
                        {
                            serviceId: p.serviceId,
                            price: p.price,
                            expressPrice: p.expressPrice,
                            isAvailable: p.isAvailable,
                            useAuto: p.expressPrice === null || p.expressPrice === (p.price ? Math.round(p.price * 1.5) : 0),
                        },
                    ]) || []
                );

                const allPrices = services.map((t) => {
                    const existingPrice = pricesMap.get(t.id);
                    return (
                        existingPrice || {
                            serviceId: t.id,
                            price: null,
                            expressPrice: null,
                            isAvailable: true,
                            useAuto: true,
                        }
                    );
                });

                setFormData({
                    name: item.name,
                    description: item.description || '',
                    category: item.category,
                    iconUrl: item.iconUrl || null,
                    isActive: item.isActive,
                    sortOrder: item.sortOrder,
                    prices: allPrices,
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    category: 'GARMENT',
                    iconUrl: null,
                    isActive: true,
                    sortOrder: 0,
                    prices: services.map((t) => ({
                        serviceId: t.id,
                        price: null,
                        expressPrice: null,
                        isAvailable: true,
                        useAuto: true,
                    })),
                });
            }
            setErrors({});
        }
    }, [open, item, services]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handlePriceChange = (serviceId: string, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            prices: prev.prices.map((p) =>
                p.serviceId === serviceId ? { ...p, [field]: value } : p
            ),
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const validPrices = formData.prices
                .filter((p): p is typeof p & { price: number } => 
                    p.price !== null && p.price > 0 && p.isAvailable
                )
                .map((p) => ({
                    serviceId: p.serviceId,
                    price: p.price, 
                    expressPrice: p.useAuto ? null : p.expressPrice,
                    isAvailable: p.isAvailable,
                }));

            const payload: CreateItemInput | UpdateItemInput = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                category: formData.category,
                iconUrl: formData.iconUrl,
                isActive: formData.isActive,
                sortOrder: formData.sortOrder,
                prices: validPrices,
            };

            if (isEditing && item) {
                await updateItem.mutateAsync({ id: item.id, data: payload });
            } else {
                await createItem.mutateAsync(payload as CreateItemInput);
            }

            onClose();
        } catch (error) {
            // Error handled by mutation
        }
    };

    const isSubmitting = createItem.isPending || updateItem.isPending || isUploadingIcon;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update item details and pricing' : 'Create a new item with service pricing'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <ServiceIconPicker
                        value={formData.iconUrl}
                        onChange={(url) => handleChange('iconUrl', url)}
                        category={formData.category}
                        onUploading={setIsUploadingIcon}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Item Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., Shirt, Bedsheet, Saree"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={cn(errors.name && 'border-red-500')}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GARMENT">Garments</SelectItem>
                                    <SelectItem value="HOUSEHOLD">Household</SelectItem>
                                    <SelectItem value="SPECIALTY">Specialty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                            placeholder="Add any details about this item..."
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Service Pricing</Label>
                            <p className="text-xs text-slate-500">Set prices for each service type</p>
                        </div>

                        <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                            {formData.prices.map((priceData) => {
                                const service = services.find((t) => t.id === priceData.serviceId);
                                if (!service) return null;

                                return (
                                    <div key={priceData.serviceId} className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={priceData.isAvailable}
                                                    onCheckedChange={(checked) =>
                                                        handlePriceChange(priceData.serviceId, 'isAvailable', checked)
                                                    }
                                                />
                                                <div>
                                                    <p className="font-medium text-sm">{service.name}</p>
                                                    <p className="text-xs text-slate-500">{service.turnaroundHours}h turnaround</p>
                                                </div>
                                            </div>
                                            {service.isCombo && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Combo
                                                </Badge>
                                            )}
                                        </div>

                                        {priceData.isAvailable && (
                                            <div className="grid grid-cols-3 gap-3 ml-11">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Base Price (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        placeholder="0"
                                                        value={priceData.price === null ? '' : priceData.price} 
                                                        onChange={(e) =>
                                                            handlePriceChange(
                                                                priceData.serviceId,
                                                                'price',
                                                                e.target.value ? parseFloat(e.target.value) : null
                                                            )
                                                        }
                                                        className="h-9"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="text-xs">Express Price (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        placeholder={
                                                            priceData.price !== null && priceData.price > 0
                                                                ? `Auto: ${Math.round(priceData.price * 1.5)}`
                                                                : 'Auto'
                                                        }
                                                        value={priceData.useAuto || priceData.expressPrice === null ? '' : priceData.expressPrice}
                                                        onChange={(e) => {
                                                            handlePriceChange(priceData.serviceId, 'useAuto', false);
                                                            handlePriceChange(
                                                                priceData.serviceId,
                                                                'expressPrice',
                                                                e.target.value ? parseFloat(e.target.value) : null
                                                            );
                                                        }}
                                                        disabled={priceData.useAuto}
                                                        className="h-9"
                                                    />
                                                </div>

                                                <div className="space-y-1 flex items-end">
                                                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={priceData.useAuto}
                                                            onChange={(e) =>
                                                                handlePriceChange(priceData.serviceId, 'useAuto', e.target.checked)
                                                            }
                                                            className="rounded"
                                                        />
                                                        Auto (1.5x)
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                        <div>
                            <Label className="font-medium">Active Item</Label>
                            <p className="text-sm text-slate-500">Inactive items won't appear in order creation</p>
                        </div>
                        <Switch checked={formData.isActive} onCheckedChange={(v) => handleChange('isActive', v)} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isEditing ? 'Update Item' : 'Create Item'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// DELETE ITEM DIALOG
// ============================================================================

interface DeleteItemDialogProps {
    open: boolean;
    onClose: () => void;
    item: Item | null;
}

function DeleteItemDialog({ open, onClose, item }: DeleteItemDialogProps) {
    const deleteItem = useDeleteItem();

    const handleDelete = async () => {
        if (!item) return;
        try {
            await deleteItem.mutateAsync(item.id);
            onClose();
        } catch (error) {}
    };

    if (!item) return null;

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <strong>"{item.name}"</strong>? This action cannot be
                        undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteItem.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteItem.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {deleteItem.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ============================================================================
// ITEM CARD COMPONENT
// ============================================================================

interface ItemCardProps {
    item: Item;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}

function ItemCard({ item, index, onEdit, onDelete, onToggle }: ItemCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className={cn(
                'relative bg-white border-2 rounded-2xl p-5 transition-all duration-200 group',
                item.isActive
                    ? 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    : 'border-slate-100 opacity-60'
            )}
        >
            <div className="flex items-start gap-3 mb-4">
                <ServiceIconDisplay iconUrl={item.iconUrl} name={item.name} size="lg" showBackground />
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 truncate mb-1">{item.name}</h3>
                    {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onToggle}>
                            {item.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Services Priced</span>
                    <Badge variant="secondary" className="text-xs">
                        {item.availablePricesCount || 0} / {item.pricesCount || 0}
                    </Badge>
                </div>

                {item.prices && item.prices.length > 0 && (
                    <div className="pt-2 border-t space-y-1">
                        {item.prices.slice(0, 3).map((price) => (
                            <div key={price.serviceId} className="flex items-center justify-between text-xs">
                                <span className="text-slate-600">{price.serviceName}</span>
                                <span className="font-semibold text-slate-900">₹{price.price}</span>
                            </div>
                        ))}
                        {item.prices.length > 3 && (
                            <p className="text-xs text-slate-400 text-center pt-1">
                                +{item.prices.length - 3} more
                            </p>
                        )}
                    </div>
                )}
            </div>

            {!item.isActive && (
                <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-xs">
                        Inactive
                    </Badge>
                </div>
            )}
        </motion.div>
    );
}

// ============================================================================
// MAIN ITEMS PAGE
// ============================================================================

export default function ItemsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [showActiveOnly, setShowActiveOnly] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [deletingItem, setDeletingItem] = useState<Item | null>(null);

    const { items, services, stats, isLoading, isError, refetch } = useItems({
        search: searchQuery,
        category: categoryFilter,
        activeOnly: showActiveOnly,
    });

    const toggleItem = useToggleItem();

    const groupedItems = useMemo(() => {
        const groups: Record<string, Item[]> = {};
        items.forEach((item) => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [items]);

    const hasActiveFilters = searchQuery || categoryFilter !== 'all' || showActiveOnly;
    const clearSearch = () => setSearchQuery('');
    const clearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setShowActiveOnly(false);
    };

    const activeFiltersCount = [categoryFilter !== 'all', showActiveOnly].filter(Boolean).length;

    return (
        <div className="flex flex-col h-full">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-4 lg:px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Items & Pricing</h1>
                        <p className="text-sm text-slate-500">
                            {stats?.active || 0} active · {stats?.total || 0} total
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="h-10 rounded-full bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                </div>

                <div className="flex gap-3">
                    <div className="flex-1">
                        <div
                            className={cn(
                                'flex items-center h-12 rounded-full border transition-all duration-200 bg-white',
                                searchQuery
                                    ? 'border-blue-400 shadow-lg shadow-blue-100/50 ring-4 ring-blue-50'
                                    : 'border-slate-200 hover:border-slate-300'
                            )}
                        >
                            <Search
                                className={cn(
                                    'w-5 h-5 ml-5 transition-colors',
                                    searchQuery ? 'text-blue-500' : 'text-slate-400'
                                )}
                            />
                            <Input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 border-0 bg-transparent h-full text-sm placeholder:text-slate-400 focus-visible:ring-0 px-3 min-w-0"
                            />
                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={clearSearch}
                                        className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'h-12 px-4 rounded-full border-slate-200 hover:bg-slate-50 relative',
                                    activeFiltersCount > 0 && 'border-blue-400 bg-blue-50 hover:bg-blue-100'
                                )}
                            >
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Filters</span>
                                {activeFiltersCount > 0 && (
                                    <Badge
                                        variant="default"
                                        className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600 text-white text-xs"
                                    >
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                                <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel className="flex items-center justify-between">
                                <span>Filter Items</span>
                                {activeFiltersCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <FilterX className="w-3 h-3 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <div className="px-2 py-2">
                                <Label className="text-xs font-medium text-slate-500 mb-2 block">Category</Label>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setCategoryFilter('all')}
                                        className={cn(
                                            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                                            categoryFilter === 'all'
                                                ? 'bg-slate-900 text-white'
                                                : 'hover:bg-slate-100 text-slate-700'
                                        )}
                                    >
                                        <Package className="w-4 h-4" />
                                        All Categories
                                        {categoryFilter === 'all' && <Check className="w-4 h-4 ml-auto" />}
                                    </button>
                                    {CATEGORIES.map((cat) => {
                                        const Icon = cat.icon;
                                        const isActive = categoryFilter === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCategoryFilter(cat.id)}
                                                className={cn(
                                                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                                                    isActive ? `${cat.bg} text-white` : 'hover:bg-slate-100 text-slate-700'
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {cat.label}
                                                {isActive && <Check className="w-4 h-4 ml-auto" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <DropdownMenuSeparator />

                            <DropdownMenuCheckboxItem
                                checked={showActiveOnly}
                                onCheckedChange={setShowActiveOnly}
                                className="py-3"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            'w-2 h-2 rounded-full',
                                            showActiveOnly ? 'bg-green-600' : 'bg-slate-300'
                                        )}
                                    />
                                    Show Active Only
                                </div>
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <AnimatePresence>
                    {searchQuery && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-slate-500 mt-3 ml-1"
                        >
                            Found <span className="font-medium text-slate-700">{items.length}</span> item
                            {items.length !== 1 ? 's' : ''}
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="flex-1 overflow-auto px-4 lg:px-6 pb-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                        <p className="text-sm text-slate-500 font-medium">Loading items...</p>
                    </div>
                ) : isError ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-red-200">
                        <p className="text-sm text-red-600 font-medium mb-2">Failed to load items</p>
                        <Button variant="outline" onClick={() => refetch()} className="mt-4 rounded-full">
                            Retry
                        </Button>
                    </div>
                ) : items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white rounded-2xl border border-slate-200"
                    >
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No items found</h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                            {hasActiveFilters
                                ? 'Try adjusting your filters to see more results'
                                : 'Get started by creating your first item'}
                        </p>
                        {hasActiveFilters ? (
                            <Button variant="ghost" onClick={clearFilters} className="rounded-full">
                                <FilterX className="w-4 h-4 mr-2" />
                                Clear Filters
                            </Button>
                        ) : (
                            <Button onClick={() => setShowCreateModal(true)} className="rounded-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Item
                            </Button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Accordion
                            type="multiple"
                            defaultValue={['GARMENT', 'HOUSEHOLD', 'SPECIALTY']}
                            className="space-y-4"
                        >
                            {CATEGORIES.map((category) => {
                                const categoryItems = groupedItems[category.id] || [];
                                if (categoryItems.length === 0) return null;

                                const CategoryIcon = category.icon;

                                return (
                                    <AccordionItem key={category.id} value={category.id} className="border-0">
                                        <AccordionTrigger className="px-5 py-4 bg-white border border-slate-200 rounded-2xl hover:no-underline hover:bg-slate-50 hover:border-slate-300 transition-all data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                                            <div className="flex items-center gap-3">
                                                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', category.bg)}>
                                                    <CategoryIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-base font-semibold text-slate-900 block">
                                                        {category.label}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="bg-white border border-t-0 border-slate-200 rounded-b-2xl px-5 pb-6 pt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                <AnimatePresence mode="popLayout">
                                                    {categoryItems.map((item, index) => (
                                                        <ItemCard
                                                            key={item.id}
                                                            item={item}
                                                            index={index}
                                                            onEdit={() => setEditingItem(item)}
                                                            onDelete={() => setDeletingItem(item)}
                                                            onToggle={() => toggleItem.mutate(item.id)}
                                                        />
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </motion.div>
                )}
            </div>

            <ItemFormModal
                open={showCreateModal || !!editingItem}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingItem(null);
                }}
                item={editingItem}
                services={services}
            />
            <DeleteItemDialog
                open={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                item={deletingItem}
            />
        </div>
    );
}