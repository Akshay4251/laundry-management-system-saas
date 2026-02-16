// app/types/inventory.ts

export type InventoryCategory = 
  | 'DETERGENT'
  | 'SOFTENER'
  | 'BLEACH'
  | 'PACKAGING'
  | 'EQUIPMENT'
  | 'CHEMICALS'
  | 'ACCESSORIES'
  | 'OTHER';

export type AdjustmentReason =
  | 'DAMAGED'
  | 'EXPIRED'
  | 'LOST'
  | 'STOLEN'
  | 'COUNT_CORRECTION'
  | 'RETURN_TO_SUPPLIER'
  | 'INTERNAL_USE'
  | 'SAMPLE'
  | 'OTHER';

export type AdjustmentType = 'ADD' | 'REMOVE';

export interface InventoryItem {
  id: string;
  businessId: string;
  storeId?: string | null;
  name: string;
  description?: string | null;
  sku?: string | null;
  category: InventoryCategory;
  currentStock: number;
  minStock: number;
  maxStock?: number | null;
  unit: string;
  costPerUnit: number;
  supplier?: string | null;
  supplierPhone?: string | null;
  supplierEmail?: string | null;
  lastRestockedAt?: string | null;
  lastRestockedBy?: string | null;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemWithStats extends InventoryItem {
  totalValue: number;
  isLowStock: boolean;
  stockPercentage: number;
  daysSinceRestock?: number;
}

export interface InventoryRestockLog {
  id: string;
  inventoryItemId: string;
  previousStock: number;
  addedStock: number;
  newStock: number;
  costPerUnit: number;
  totalCost: number;
  notes?: string | null;
  restockedBy?: string | null;
  createdAt: string;
}

export interface InventoryFilters {
  search?: string;
  category?: InventoryCategory | 'all';
  lowStockOnly?: boolean;
  storeId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'currentStock' | 'costPerUnit' | 'lastRestockedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface CreateInventoryInput {
  name: string;
  description?: string | null;
  sku?: string | null;
  category: InventoryCategory;
  currentStock: number;
  minStock: number;
  maxStock?: number | null;
  unit: string;
  costPerUnit: number;
  supplier?: string | null;
  supplierPhone?: string | null;
  supplierEmail?: string | null;
  storeId?: string | null;
}

export interface UpdateInventoryInput {
  name?: string;
  description?: string | null;
  sku?: string | null;
  category?: InventoryCategory;
  minStock?: number;
  maxStock?: number | null;
  unit?: string;
  costPerUnit?: number;
  supplier?: string | null;
  supplierPhone?: string | null;
  supplierEmail?: string | null;
  isActive?: boolean;
}

export interface RestockInput {
  addedStock: number;
  costPerUnit?: number;
  notes?: string;
}

export interface StockAdjustmentInput {
  type: AdjustmentType;
  quantity: number;
  reason: AdjustmentReason;
  notes?: string;
  costPerUnit?: number;
}

export interface PaginatedInventory {
  data: InventoryItemWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryCounts: Record<InventoryCategory, number>;
}

// Category display configuration
export const INVENTORY_CATEGORY_CONFIG: Record<InventoryCategory, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  DETERGENT: {
    label: 'Detergent',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  SOFTENER: {
    label: 'Softener',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  BLEACH: {
    label: 'Bleach',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  PACKAGING: {
    label: 'Packaging',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  EQUIPMENT: {
    label: 'Equipment',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  CHEMICALS: {
    label: 'Chemicals',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  ACCESSORIES: {
    label: 'Accessories',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  OTHER: {
    label: 'Other',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
};

// Adjustment reason display configuration
export const ADJUSTMENT_REASON_CONFIG: Record<AdjustmentReason, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  DAMAGED: {
    label: 'Damaged',
    description: 'Items damaged and cannot be used',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  EXPIRED: {
    label: 'Expired',
    description: 'Items past expiration date',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  LOST: {
    label: 'Lost',
    description: 'Items cannot be located',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
  },
  STOLEN: {
    label: 'Stolen',
    description: 'Items suspected stolen',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
  },
  COUNT_CORRECTION: {
    label: 'Count Correction',
    description: 'Physical count differs from system',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  RETURN_TO_SUPPLIER: {
    label: 'Return to Supplier',
    description: 'Items returned to vendor',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  INTERNAL_USE: {
    label: 'Internal Use',
    description: 'Used internally, not sold',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
  },
  SAMPLE: {
    label: 'Sample/Demo',
    description: 'Given as samples or demos',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
  },
  OTHER: {
    label: 'Other',
    description: 'Other reason',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
  },
};