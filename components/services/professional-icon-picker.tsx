'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  X,
  Download,
  FilterX,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  Check,
  Clock,
  Zap,
  ToggleLeft,
  ToggleRight,
  Shirt,
  Home,
  Sparkles,
  Grid3X3,
  List,
  Loader2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useToggleService,
  Service,
  CreateServiceInput,
  UpdateServiceInput,
} from '@/app/hooks/use-services';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

type CategoryType = 'all' | 'GARMENT' | 'HOUSEHOLD' | 'SPECIALTY';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'GARMENT', label: 'Garments' },
  { value: 'HOUSEHOLD', label: 'Household' },
  { value: 'SPECIALTY', label: 'Specialty' },
] as const;

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    icon: any;
    color: string;
    bg: string;
    lightBg: string;
  }
> = {
  GARMENT: {
    label: 'Garments',
    icon: Shirt,
    color: 'text-blue-600',
    bg: 'bg-blue-600',
    lightBg: 'bg-blue-50',
  },
  HOUSEHOLD: {
    label: 'Household',
    icon: Home,
    color: 'text-purple-600',
    bg: 'bg-purple-600',
    lightBg: 'bg-purple-50',
  },
  SPECIALTY: {
    label: 'Specialty',
    icon: Sparkles,
    color: 'text-orange-600',
    bg: 'bg-orange-600',
    lightBg: 'bg-orange-50',
  },
};

const UNIT_OPTIONS = [
  { value: 'piece', label: 'Per Piece' },
  { value: 'kg', label: 'Per Kg' },
  { value: 'set', label: 'Per Set' },
  { value: 'pair', label: 'Per Pair' },
  { value: 'meter', label: 'Per Meter' },
];

const PREDEFINED_SERVICE_TYPES = [
  'Wash & Iron',
  'Dry Clean',
  'Iron Only',
  'Steam Press',
  'Wash & Fold',
  'Starch',
  'Special Care',
  'Conditioning',
  'Stain Removal',
  'Alterations',
];

// Helper function
function formatTurnaroundTime(hours: number): string {
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  return `${days}d ${remainingHours}h`;
}

// ============================================================================
// SIMPLE IMAGE UPLOAD COMPONENT
// ============================================================================

interface SimpleImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  onUploading?: (isUploading: boolean) => void;
}

function SimpleImageUpload({ value, onChange, onUploading }: SimpleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes externally
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Use JPG, PNG, WebP, SVG, or GIF.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    onUploading?.(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/service-icon', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { data } = await res.json();
      onChange(data.url);
      toast.success('Icon uploaded!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
      setPreview(value); // Revert preview
    } finally {
      setIsUploading(false);
      onUploading?.(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Service Icon</Label>
      
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl transition-all duration-200',
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : preview
            ? 'border-slate-200 bg-white'
            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          // Preview Mode
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* Icon Preview */}
              <div className="relative w-20 h-20 rounded-xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                ) : (
                  <img
                    src={preview}
                    alt="Service icon"
                    className="w-full h-full object-contain p-2"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 mb-1">
                  {isUploading ? 'Uploading...' : 'Icon Selected'}
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  Click below to change or remove
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Upload Mode
          <label className="cursor-pointer block p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                {dragActive ? 'Drop image here' : 'Upload service icon'}
              </p>
              <p className="text-xs text-slate-500 mb-3">
                Drag & drop or click to browse
              </p>
              <p className="text-[10px] text-slate-400">
                PNG, JPG, WebP, SVG, GIF • Max 5MB
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
              onChange={handleInputChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Optional tip */}
      {!preview && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" />
          Recommended: Square image (512×512px) with transparent background
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SERVICE ICON DISPLAY (For Grid/List)
// ============================================================================

interface ServiceIconDisplayProps {
  iconUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function ServiceIconDisplay({ iconUrl, size = 'md', className }: ServiceIconDisplayProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  if (iconUrl) {
    return (
      <div
        className={cn(
          'rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden',
          sizeClasses[size],
          className
        )}
      >
        <img
          src={iconUrl}
          alt="Service icon"
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }

  // Default placeholder
  return (
    <div
      className={cn(
        'rounded-lg bg-slate-100 flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      <Shirt className="w-1/2 h-1/2 text-slate-400" />
    </div>
  );
}

// ============================================================================
// CREATE SERVICE MODAL
// ============================================================================

interface CreateServiceModalProps {
  open: boolean;
  onClose: () => void;
}

function CreateServiceModal({ open, onClose }: CreateServiceModalProps) {
  const createService = useCreateService();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'GARMENT',
    iconUrl: null as string | null,
    basePrice: 0,
    expressPrice: null as number | null,
    unit: 'piece',
    turnaroundTime: 24,
    serviceTypes: [] as string[],
    isActive: true,
  });

  const [customServiceType, setCustomServiceType] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: '',
        category: 'GARMENT',
        iconUrl: null,
        basePrice: 0,
        expressPrice: null,
        unit: 'piece',
        turnaroundTime: 24,
        serviceTypes: [],
        isActive: true,
      });
      setErrors({});
      setCustomServiceType('');
    }
  }, [open]);

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

  const addServiceType = (type: string) => {
    if (type && !formData.serviceTypes.includes(type)) {
      handleChange('serviceTypes', [...formData.serviceTypes, type]);
    }
  };

  const removeServiceType = (type: string) => {
    handleChange(
      'serviceTypes',
      formData.serviceTypes.filter((t) => t !== type)
    );
  };

  const handleAddCustomType = () => {
    if (customServiceType.trim()) {
      addServiceType(customServiceType.trim());
      setCustomServiceType('');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.basePrice <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0';
    }

    if (
      formData.expressPrice !== null &&
      formData.expressPrice < formData.basePrice
    ) {
      newErrors.expressPrice = 'Express price should be higher than base price';
    }

    if (formData.turnaroundTime < 1) {
      newErrors.turnaroundTime = 'Turnaround time must be at least 1 hour';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createService.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category as any,
        iconUrl: formData.iconUrl,
        basePrice: formData.basePrice,
        expressPrice: formData.expressPrice || Math.round(formData.basePrice * 1.5),
        unit: formData.unit,
        turnaroundTime: formData.turnaroundTime,
        serviceTypes: formData.serviceTypes,
        isActive: formData.isActive,
      });
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  const isSubmitting = createService.isPending || isUploadingIcon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>
            Create a new service for your laundry business
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Image Upload */}
          <SimpleImageUpload
            value={formData.iconUrl}
            onChange={(url) => handleChange('iconUrl', url)}
            onUploading={setIsUploadingIcon}
          />

          {/* Name & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Service Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Shirt, Saree, Bedsheet"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.filter((o) => o.value !== 'all').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any details about this service..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">
                Base Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.basePrice || ''}
                onChange={(e) =>
                  handleChange('basePrice', parseFloat(e.target.value) || 0)
                }
                className={cn(errors.basePrice && 'border-red-500')}
              />
              {errors.basePrice && (
                <p className="text-xs text-red-500">{errors.basePrice}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expressPrice">Express Price (₹)</Label>
              <Input
                id="expressPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="Auto: 1.5x base"
                value={formData.expressPrice || ''}
                onChange={(e) =>
                  handleChange(
                    'expressPrice',
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                className={cn(errors.expressPrice && 'border-red-500')}
              />
              {errors.expressPrice && (
                <p className="text-xs text-red-500">{errors.expressPrice}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Turnaround Time */}
          <div className="space-y-2">
            <Label htmlFor="turnaroundTime">Turnaround Time (hours)</Label>
            <Input
              id="turnaroundTime"
              type="number"
              min="1"
              max="720"
              placeholder="24"
              value={formData.turnaroundTime || ''}
              onChange={(e) =>
                handleChange('turnaroundTime', parseInt(e.target.value) || 24)
              }
              className={cn(errors.turnaroundTime && 'border-red-500')}
            />
            <p className="text-xs text-slate-500">
              {formData.turnaroundTime >= 24
                ? `≈ ${Math.floor(formData.turnaroundTime / 24)} day(s)`
                : `${formData.turnaroundTime} hour(s)`}
            </p>
            {errors.turnaroundTime && (
              <p className="text-xs text-red-500">{errors.turnaroundTime}</p>
            )}
          </div>

          {/* Service Types */}
          <div className="space-y-3">
            <Label>Service Types</Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_SERVICE_TYPES.map((type) => {
                const isSelected = formData.serviceTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      isSelected ? removeServiceType(type) : addServiceType(type)
                    }
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-all duration-150',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    )}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Custom Type Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom service type..."
                value={customServiceType}
                onChange={(e) => setCustomServiceType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomType();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCustomType}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Types */}
            {formData.serviceTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-xs text-slate-500 mr-1">Selected:</span>
                {formData.serviceTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="gap-1 pr-1">
                    {type}
                    <button
                      type="button"
                      onClick={() => removeServiceType(type)}
                      className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
            <div>
              <Label htmlFor="isActive" className="font-medium">
                Active Service
              </Label>
              <p className="text-sm text-slate-500">
                Inactive services won't appear in order creation
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// EDIT SERVICE MODAL
// ============================================================================

interface EditServiceModalProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
}

function EditServiceModal({ open, onClose, service }: EditServiceModalProps) {
  const updateService = useUpdateService();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'GARMENT',
    iconUrl: null as string | null,
    basePrice: 0,
    expressPrice: null as number | null,
    unit: 'piece',
    turnaroundTime: 24,
    serviceTypes: [] as string[],
    isActive: true,
  });

  const [customServiceType, setCustomServiceType] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  // Initialize form when service changes
  useEffect(() => {
    if (service && open) {
      setFormData({
        name: service.name,
        description: service.description || '',
        category: service.category,
        iconUrl: service.iconUrl || null,
        basePrice: service.basePrice,
        expressPrice: service.expressPrice || null,
        unit: service.unit,
        turnaroundTime: service.turnaroundTime,
        serviceTypes: service.serviceTypes || [],
        isActive: service.isActive,
      });
      setErrors({});
      setCustomServiceType('');
    }
  }, [service, open]);

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

  const addServiceType = (type: string) => {
    if (type && !formData.serviceTypes.includes(type)) {
      handleChange('serviceTypes', [...formData.serviceTypes, type]);
    }
  };

  const removeServiceType = (type: string) => {
    handleChange(
      'serviceTypes',
      formData.serviceTypes.filter((t) => t !== type)
    );
  };

  const handleAddCustomType = () => {
    if (customServiceType.trim()) {
      addServiceType(customServiceType.trim());
      setCustomServiceType('');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.basePrice <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0';
    }

    if (
      formData.expressPrice !== null &&
      formData.expressPrice < formData.basePrice
    ) {
      newErrors.expressPrice = 'Express price should be higher than base price';
    }

    if (formData.turnaroundTime < 1) {
      newErrors.turnaroundTime = 'Turnaround time must be at least 1 hour';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!service || !validate()) return;

    try {
      await updateService.mutateAsync({
        id: service.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category as any,
          iconUrl: formData.iconUrl,
          basePrice: formData.basePrice,
          expressPrice: formData.expressPrice,
          unit: formData.unit,
          turnaroundTime: formData.turnaroundTime,
          serviceTypes: formData.serviceTypes,
          isActive: formData.isActive,
        },
      });
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  if (!service) return null;

  const isSubmitting = updateService.isPending || isUploadingIcon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Update the details for "{service.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Image Upload */}
          <SimpleImageUpload
            value={formData.iconUrl}
            onChange={(url) => handleChange('iconUrl', url)}
            onUploading={setIsUploadingIcon}
          />

          {/* Name & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Service Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Shirt, Saree, Bedsheet"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.filter((o) => o.value !== 'all').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Add any details about this service..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-basePrice">
                Base Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-basePrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.basePrice || ''}
                onChange={(e) =>
                  handleChange('basePrice', parseFloat(e.target.value) || 0)
                }
                className={cn(errors.basePrice && 'border-red-500')}
              />
              {errors.basePrice && (
                <p className="text-xs text-red-500">{errors.basePrice}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-expressPrice">Express Price (₹)</Label>
              <Input
                id="edit-expressPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="Optional"
                value={formData.expressPrice || ''}
                onChange={(e) =>
                  handleChange(
                    'expressPrice',
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                className={cn(errors.expressPrice && 'border-red-500')}
              />
              {errors.expressPrice && (
                <p className="text-xs text-red-500">{errors.expressPrice}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Turnaround Time */}
          <div className="space-y-2">
            <Label htmlFor="edit-turnaroundTime">Turnaround Time (hours)</Label>
            <Input
              id="edit-turnaroundTime"
              type="number"
              min="1"
              max="720"
              placeholder="24"
              value={formData.turnaroundTime || ''}
              onChange={(e) =>
                handleChange('turnaroundTime', parseInt(e.target.value) || 24)
              }
              className={cn(errors.turnaroundTime && 'border-red-500')}
            />
            <p className="text-xs text-slate-500">
              {formData.turnaroundTime >= 24
                ? `≈ ${Math.floor(formData.turnaroundTime / 24)} day(s)`
                : `${formData.turnaroundTime} hour(s)`}
            </p>
            {errors.turnaroundTime && (
              <p className="text-xs text-red-500">{errors.turnaroundTime}</p>
            )}
          </div>

          {/* Service Types */}
          <div className="space-y-3">
            <Label>Service Types</Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_SERVICE_TYPES.map((type) => {
                const isSelected = formData.serviceTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      isSelected ? removeServiceType(type) : addServiceType(type)
                    }
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-all duration-150',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    )}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Custom Type Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom service type..."
                value={customServiceType}
                onChange={(e) => setCustomServiceType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomType();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCustomType}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Types */}
            {formData.serviceTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-xs text-slate-500 mr-1">Selected:</span>
                {formData.serviceTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="gap-1 pr-1">
                    {type}
                    <button
                      type="button"
                      onClick={() => removeServiceType(type)}
                      className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
            <div>
              <Label htmlFor="edit-isActive" className="font-medium">
                Active Service
              </Label>
              <p className="text-sm text-slate-500">
                Inactive services won't appear in order creation
              </p>
            </div>
            <Switch
              id="edit-isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
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
      // Error handled by hook
    }
  };

  if (!service) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Are you sure you want to delete <strong>"{service.name}"</strong>?
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteService.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteService.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteService.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// MAIN SERVICES PAGE (Rest of your code - unchanged)
// ============================================================================

export default function ServicesPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  // Fetch services
  const { services, stats, isLoading, isError, refetch } = useServices({
    search: searchQuery,
    category: categoryFilter,
    activeOnly: showActiveOnly,
  });

  // Toggle mutation
  const toggleService = useToggleService();

  // Group services by category
  const groupedServices = useMemo(() => {
    const groups: Record<string, Service[]> = {};

    services.forEach((service) => {
      const cat = service.category;
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(service);
    });

    const order = ['GARMENT', 'HOUSEHOLD', 'SPECIALTY'];
    const sorted: Record<string, Service[]> = {};
    order.forEach((cat) => {
      if (groups[cat]) {
        sorted[cat] = groups[cat].sort((a, b) => a.basePrice - b.basePrice);
      }
    });

    return sorted;
  }, [services]);

  const hasActiveFilters =
    searchQuery !== '' || categoryFilter !== 'all' || showActiveOnly;
  const currentCategory = CATEGORY_OPTIONS.find(
    (opt) => opt.value === categoryFilter
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setShowActiveOnly(false);
  };

  const handleToggleService = async (service: Service) => {
    await toggleService.mutateAsync(service.id);
  };

  const handleExport = () => {
    const headers = [
      'Name',
      'Category',
      'Base Price',
      'Express Price',
      'Turnaround Time',
      'Service Types',
      'Status',
    ];
    const rows = services.map((s) => [
      s.name,
      s.category,
      s.basePrice,
      s.expressPrice || 'N/A',
      formatTurnaroundTime(s.turnaroundTime),
      s.serviceTypes.join('; '),
      s.isActive ? 'Active' : 'Inactive',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `services-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Services</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">
                  Manage pricing and service options
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">
                  {stats?.active || 0}/{stats?.total || 0} active
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
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
                onClick={() => setShowCreateModal(true)}
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
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
            </button>

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
                    <span className="font-semibold text-slate-900">
                      {services.length}
                    </span>{' '}
                    services found
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-red-600 mb-4">Failed to load services</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200">
                <Shirt className="w-9 h-9 text-slate-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No services found
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters.'
                : 'Get started by creating your first service.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={handleClearFilters}>
                <FilterX className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Service
              </Button>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, categoryServices]) => {
              const config = CATEGORY_CONFIG[category];
              if (!config) return null;
              const CategoryIcon = config.icon;

              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bg)}>
                      <CategoryIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900">{config.label}</h2>
                      <p className="text-xs text-slate-500">{categoryServices.length} services</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryServices.map((service) => (
                      <div
                        key={service.id}
                        className={cn(
                          'bg-white border rounded-2xl p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300',
                          !service.isActive && 'opacity-60'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <ServiceIconDisplay iconUrl={service.iconUrl} size="md" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 truncate">
                                {service.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-500">
                                  {formatTurnaroundTime(service.turnaroundTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => setEditingService(service)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleService(service)}
                                disabled={toggleService.isPending}
                              >
                                {service.isActive ? (
                                  <ToggleLeft className="w-4 h-4 mr-2" />
                                ) : (
                                  <ToggleRight className="w-4 h-4 mr-2" />
                                )}
                                {service.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeletingService(service)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {service.serviceTypes.slice(0, 2).map((s, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                          {service.serviceTypes.length > 2 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              +{service.serviceTypes.length - 2}
                            </span>
                          )}
                        </div>

                        <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Base</p>
                            <p className="font-bold text-lg text-slate-900">₹{service.basePrice}</p>
                          </div>
                          {service.expressPrice && (
                            <div className="text-right">
                              <p className="text-xs text-blue-600 mb-0.5 flex items-center justify-end gap-0.5">
                                <Zap className="w-3 h-3" />
                                Express
                              </p>
                              <p className="font-bold text-lg text-blue-600">₹{service.expressPrice}</p>
                            </div>
                          )}
                        </div>

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
          // List view - similar structure
          <div className="space-y-6">
            {Object.entries(groupedServices).map(([category, categoryServices]) => {
              const config = CATEGORY_CONFIG[category];
              if (!config) return null;
              const CategoryIcon = config.icon;

              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bg)}>
                      <CategoryIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900">{config.label}</h2>
                      <p className="text-xs text-slate-500">{categoryServices.length} services</p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-100">
                        {categoryServices.map((service) => (
                          <tr key={service.id} className={cn('hover:bg-slate-50/70', !service.isActive && 'opacity-60')}>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <ServiceIconDisplay iconUrl={service.iconUrl} size="sm" />
                                <div>
                                  <p className="font-medium text-slate-900">{service.name}</p>
                                  {!service.isActive && <span className="text-xs text-slate-400">Inactive</span>}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">{formatTurnaroundTime(service.turnaroundTime)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <span className="font-semibold text-slate-900">₹{service.basePrice}</span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              {service.expressPrice && (
                                <div className="inline-flex items-center gap-1 text-blue-600">
                                  <Zap className="w-3 h-3" />
                                  <span className="font-semibold">₹{service.expressPrice}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="w-4 h-4 text-slate-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem onClick={() => setEditingService(service)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleToggleService(service)}
                                      disabled={toggleService.isPending}
                                    >
                                      {service.isActive ? 'Deactivate' : 'Activate'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => setDeletingService(service)}
                                    >
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateServiceModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <EditServiceModal open={!!editingService} onClose={() => setEditingService(null)} service={editingService} />
      <DeleteServiceDialog open={!!deletingService} onClose={() => setDeletingService(null)} service={deletingService} />
    </div>
  );
}