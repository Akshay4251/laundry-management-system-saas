// lib/validations/inventory.ts
import { z } from 'zod';

const inventoryCategoryEnum = z.enum([
  'DETERGENT',
  'SOFTENER',
  'BLEACH',
  'PACKAGING',
  'EQUIPMENT',
  'CHEMICALS',
  'ACCESSORIES',
  'OTHER',
]);

// ============= Adjustment Reason Enum =============
export const adjustmentReasonEnum = z.enum([
  'DAMAGED',
  'EXPIRED',
  'LOST',
  'STOLEN',
  'COUNT_CORRECTION',
  'RETURN_TO_SUPPLIER',
  'INTERNAL_USE',
  'SAMPLE',
  'OTHER',
]);

export type AdjustmentReason = z.infer<typeof adjustmentReasonEnum>;

// ============= Create Inventory Schema =============
export const createInventorySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim(),

  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .nullable(),

  sku: z
    .string()
    .max(50, 'SKU is too long')
    .optional()
    .nullable()
    .transform((val) => val?.toUpperCase() || null),

  category: inventoryCategoryEnum.default('OTHER'),

  currentStock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .default(0),

  minStock: z
    .number()
    .int('Min stock must be a whole number')
    .min(0, 'Min stock cannot be negative')
    .default(10),

  maxStock: z
    .number()
    .int('Max stock must be a whole number')
    .min(0, 'Max stock cannot be negative')
    .optional()
    .nullable(),

  unit: z
    .string()
    .min(1, 'Unit is required')
    .max(20, 'Unit is too long')
    .default('pieces'),

  costPerUnit: z
    .number()
    .min(0, 'Cost cannot be negative')
    .default(0),

  supplier: z
    .string()
    .max(100, 'Supplier name is too long')
    .optional()
    .nullable(),

  supplierPhone: z
    .string()
    .max(20, 'Phone is too long')
    .optional()
    .nullable(),

  supplierEmail: z
    .string()
    .email('Invalid email')
    .optional()
    .nullable()
    .or(z.literal('')),

  storeId: z
    .string()
    .optional()
    .nullable(),

  isActive: z
    .boolean()
    .optional()
    .default(true),
});

// ============= Update Inventory Schema =============
export const updateInventorySchema = createInventorySchema
  .partial()
  .omit({ currentStock: true }); // Stock is updated via restock or adjust endpoint

// ============= Restock Schema =============
export const restockSchema = z.object({
  addedStock: z
    .number()
    .int('Stock must be a whole number')
    .min(1, 'Must add at least 1 unit'),

  costPerUnit: z
    .number()
    .min(0, 'Cost cannot be negative')
    .optional(),

  notes: z
    .string()
    .max(500, 'Notes are too long')
    .optional(),
});

// ============= Stock Adjustment Schema =============
export const stockAdjustmentSchema = z.object({
  type: z.enum(['ADD', 'REMOVE']),
  
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),

  reason: adjustmentReasonEnum,

  notes: z
    .string()
    .max(500, 'Notes too long')
    .optional(),

  costPerUnit: z
    .number()
    .min(0, 'Cost cannot be negative')
    .optional(),
});

// ============= Query Parameters Schema =============
export const inventoryQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),

  category: z
    .enum(['all', 'DETERGENT', 'SOFTENER', 'BLEACH', 'PACKAGING', 'EQUIPMENT', 'CHEMICALS', 'ACCESSORIES', 'OTHER'])
    .optional()
    .nullable()
    .default('all')
    .transform((val) => val || 'all'),

  lowStockOnly: z
    .union([z.string(), z.boolean()])
    .optional()
    .nullable()
    .default(false)
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val === 'true';
      return false;
    }),

  storeId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),

  page: z
    .string()
    .optional()
    .nullable()
    .default('1')
    .transform((val) => parseInt(val || '1', 10))
    .pipe(z.number().int().positive()),

  limit: z
    .string()
    .optional()
    .nullable()
    .default('50')
    .transform((val) => parseInt(val || '50', 10))
    .pipe(z.number().int().min(1).max(100)),

  sortBy: z
    .enum(['name', 'currentStock', 'costPerUnit', 'lastRestockedAt', 'createdAt'])
    .optional()
    .nullable()
    .default('name')
    .transform((val) => val || 'name'),

  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .nullable()
    .default('asc')
    .transform((val) => val || 'asc'),

  includeDeleted: z
    .union([z.string(), z.boolean()])
    .optional()
    .nullable()
    .default(false)
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val === 'true';
      return false;
    }),
});

// ============= Type Exports =============
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type RestockInput = z.infer<typeof restockSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type InventoryQueryParams = z.infer<typeof inventoryQuerySchema>;