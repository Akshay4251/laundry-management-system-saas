//app/(dashboard)/services/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  X,
  FilterX,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Wrench,
  Clock,
  Package2,
  SlidersHorizontal,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useToggleService,
} from '@/app/hooks/use-services';
import type { Service, CreateServiceInput, UpdateServiceInput } from '@/app/types/service';
import { toast } from 'sonner';

// ============================================================================
// SERVICE FORM MODAL
// ============================================================================

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
}

function ServiceFormModal({ open, onClose, service }: ServiceFormModalProps) {
  const isEditing = !!service;
  const createService = useCreateService();
  const updateService = useUpdateService();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    turnaroundHours: 24,
    isCombo: false,
    isActive: true,
    sortOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  React.useEffect(() => {
    if (open) {
      if (service) {
        setFormData({
          name: service.name,
          code: service.code,
          description: service.description || '',
          turnaroundHours: service.turnaroundHours,
          isCombo: service.isCombo,
          isActive: service.isActive,
          sortOrder: service.sortOrder,
        });
      } else {
        setFormData({
          name: '',
          code: '',
          description: '',
          turnaroundHours: 24,
          isCombo: false,
          isActive: true,
          sortOrder: 0,
        });
      }
      setErrors({});
    }
  }, [open, service]);

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

  // Auto-generate code from name
  const handleNameChange = (name: string) => {
    handleChange('name', name);
    if (!isEditing) {
      const autoCode = name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      handleChange('code', autoCode);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    if (!/^[A-Z][A-Z0-9_]*$/.test(formData.code)) {
      newErrors.code = 'Code must be uppercase letters, numbers, and underscores';
    }
    if (formData.turnaroundHours < 1 || formData.turnaroundHours > 720) {
      newErrors.turnaroundHours = 'Turnaround must be between 1 and 720 hours';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload: CreateServiceInput | UpdateServiceInput = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || null,
        turnaroundHours: formData.turnaroundHours,
        isCombo: formData.isCombo,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      };

      if (isEditing) {
        await updateService.mutateAsync({ id: service.id, data: payload });
      } else {
        await createService.mutateAsync(payload as CreateServiceInput);
      }

      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isSubmitting = createService.isPending || updateService.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update service details'
              : 'Create a new service type for your services'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Name & Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Service Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Wash + Iron"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">
                Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="WASH_IRON"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                className={cn(errors.code && 'border-red-500')}
                disabled={isEditing}
              />
              {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
              {!isEditing && (
                <p className="text-xs text-slate-500">Auto-generated from name, can be edited</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Describe what this service includes..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Turnaround Time */}
          <div className="space-y-2">
            <Label htmlFor="turnaround">
              Turnaround Time (hours) <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="turnaround"
                type="number"
                min="1"
                max="720"
                value={formData.turnaroundHours}
                onChange={(e) => handleChange('turnaroundHours', parseInt(e.target.value) || 24)}
                className={cn('max-w-[200px]', errors.turnaroundHours && 'border-red-500')}
              />
              <span className="text-sm text-slate-500">
                ≈{' '}
                {formData.turnaroundHours < 24
                  ? `${formData.turnaroundHours}h`
                  : `${Math.floor(formData.turnaroundHours / 24)}d ${
                      formData.turnaroundHours % 24
                    }h`}
              </span>
            </div>
            {errors.turnaroundHours && (
              <p className="text-xs text-red-500">{errors.turnaroundHours}</p>
            )}
          </div>

          {/* Combo Service Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <Label className="font-medium text-blue-900">Combo Service</Label>
              <p className="text-sm text-blue-700">
                Is this a combination of multiple services? (e.g., Wash + Iron)
              </p>
            </div>
            <Switch
              checked={formData.isCombo}
              onCheckedChange={(v) => handleChange('isCombo', v)}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
            <div>
              <Label className="font-medium">Active Service</Label>
              <p className="text-sm text-slate-500">
                Inactive services won't appear when creating items
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(v) => handleChange('isActive', v)}
            />
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>💡 Note:</strong> After creating a service, you can set prices for each
              item in the Items & Pricing page.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Service' : 'Create Service'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// DELETE SERVICE DIALOG
// ============================================================================

interface DeleteServiceDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
}

function DeleteServiceDialog({ open, onClose, service }: DeleteServiceDialogProps) {
  const deleteService = useDeleteService();

  const handleDelete = async () => {
    if (!service) return;
    try {
      await deleteService.mutateAsync(service.id);
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!service) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Service</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>"{service.name}"</strong>? This will also
            remove all associated pricing. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteService.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteService.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteService.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// SERVICE CARD COMPONENT
// ============================================================================

interface ServiceCardProps {
  service: Service;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function ServiceCard({ service, index, onEdit, onDelete, onToggle }: ServiceCardProps) {
  const formatTurnaround = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'relative bg-white border-2 rounded-2xl p-5 transition-all duration-200 group',
        service.isActive
          ? 'border-slate-200 hover:border-slate-300 hover:shadow-md'
          : 'border-slate-100 opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-base text-slate-900">{service.name}</h3>
            {service.isCombo && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                Combo
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded inline-block">
            {service.code}
          </p>
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
              {service.isActive ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {service.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Turnaround</p>
            <p className="font-semibold text-sm text-slate-900">{formatTurnaround(service.turnaroundHours)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Package2 className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Items Priced</p>
            <p className="font-semibold text-sm text-slate-900">{service.itemsCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Inactive Badge */}
      {!service.isActive && (
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
// MAIN SERVICES PAGE
// ============================================================================

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  const { services, stats, isLoading, isError, refetch } = useServices({
    search: searchQuery,
    activeOnly: showActiveOnly,
  });

  const toggleService = useToggleService();

  const clearSearch = () => setSearchQuery('');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-4 lg:px-6 py-6">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Services</h1>
            <p className="text-sm text-slate-500">
              {stats?.active || 0} active · {stats?.total || 0} total · {stats?.combo || 0} combo
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="h-10 rounded-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          {/* Search Bar */}
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
                placeholder="Search services..."
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

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-12 px-4 rounded-full border-slate-200 hover:bg-slate-50',
                  showActiveOnly && 'border-blue-400 bg-blue-50 hover:bg-blue-100'
                )}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Filters</span>
                {showActiveOnly && (
                  <Badge
                    variant="default"
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600 text-white text-xs"
                  >
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
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

        {/* Search Results */}
        <AnimatePresence>
          {searchQuery && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-slate-500 mt-3 ml-1"
            >
              Found <span className="font-medium text-slate-700">{services.length}</span> service
              {services.length !== 1 ? 's' : ''}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm text-slate-500 font-medium">Loading services...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-red-200">
            <p className="text-sm text-red-600 font-medium mb-2">Failed to load services</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-4 rounded-full">
              Retry
            </Button>
          </div>
        ) : services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl border border-slate-200"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No services found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              {searchQuery || showActiveOnly
                ? 'Try adjusting your filters to see more results'
                : 'Get started by creating your first service'}
            </p>
            {searchQuery || showActiveOnly ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setShowActiveOnly(false);
                }}
                className="rounded-full"
              >
                <FilterX className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => setShowCreateModal(true)} className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Service
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {services.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    index={index}
                    onEdit={() => setEditingService(service)}
                    onDelete={() => setDeletingService(service)}
                    onToggle={() => toggleService.mutate(service.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <ServiceFormModal
        open={showCreateModal || !!editingService}
        onClose={() => {
          setShowCreateModal(false);
          setEditingService(null);
        }}
        service={editingService}
      />
      <DeleteServiceDialog
        open={!!deletingService}
        onClose={() => setDeletingService(null)}
        service={deletingService}
      />
    </div>
  );
}