// lib/validations/store.ts

import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(100),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(100).optional(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;