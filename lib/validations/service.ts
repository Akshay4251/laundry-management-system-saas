// lib/validations/service.ts

import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(['GARMENT', 'HOUSEHOLD', 'SPECIALTY']),
  
  // ✅ Simple: Just the icon URL
  iconUrl: z.string().url('Invalid URL').optional().nullable(),
  
  basePrice: z.number().positive('Price must be greater than 0'),
  expressPrice: z.number().positive().optional().nullable(),
  unit: z.string().default('piece'),
  turnaroundTime: z.number().int().min(1).max(720).default(24),
  serviceTypes: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(['GARMENT', 'HOUSEHOLD', 'SPECIALTY']).optional(),
  iconUrl: z.string().url().optional().nullable(),
  basePrice: z.number().positive().optional(),
  expressPrice: z.number().positive().optional().nullable(),
  unit: z.string().optional(),
  turnaroundTime: z.number().int().min(1).max(720).optional(),
  serviceTypes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// For predefined icons
export const createServiceIconSchema = z.object({
  name: z.string().min(2).max(100),
  imageUrl: z.string().url(),
  category: z.enum(['GARMENT', 'HOUSEHOLD', 'SPECIALTY']),
  tags: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateServiceIconInput = z.infer<typeof createServiceIconSchema>;