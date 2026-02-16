// lib/validations/item.ts

import { z } from 'zod';

// Price entry for a single treatment
const treatmentPriceSchema = z.object({
  treatmentId: z.string().min(1, 'Treatment ID is required'),
  price: z.number().positive('Price must be greater than 0'),
  expressPrice: z.number().positive().optional().nullable(),
  isAvailable: z.boolean().default(true),
});

// Create item with inline pricing
export const createItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(['GARMENT', 'HOUSEHOLD', 'SPECIALTY']),
  iconUrl: z.string().url('Invalid URL').optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  // Inline pricing - set prices while creating item
  prices: z.array(treatmentPriceSchema).optional().default([]),
});

// Update item with inline pricing
export const updateItemSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(['GARMENT', 'HOUSEHOLD', 'SPECIALTY']).optional(),
  iconUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  // Inline pricing updates
  prices: z.array(treatmentPriceSchema).optional(),
});

// Bulk update prices for an item
export const updateItemPricesSchema = z.object({
  prices: z.array(treatmentPriceSchema).min(1, 'At least one price is required'),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type UpdateItemPricesInput = z.infer<typeof updateItemPricesSchema>;