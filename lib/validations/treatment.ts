// lib/validations/treatment.ts

import { z } from 'zod';

export const createTreatmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Treatment name must be at least 2 characters')
    .max(100, 'Treatment name is too long')
    .trim(),

  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code is too long')
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase letters, numbers, and underscores only')
    .optional(),

  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .nullable(),

  iconUrl: z
    .string()
    .url('Invalid URL format')
    .optional()
    .nullable(),

  isCombo: z.boolean().optional().default(false),

  turnaroundHours: z
    .number()
    .int()
    .min(1, 'Turnaround must be at least 1 hour')
    .max(720, 'Turnaround cannot exceed 30 days')
    .optional()
    .default(24),

  isActive: z.boolean().optional().default(true),

  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateTreatmentSchema = createTreatmentSchema.partial();

export function generateTreatmentCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 20);
}

export type CreateTreatmentInput = z.infer<typeof createTreatmentSchema>;
export type UpdateTreatmentInput = z.infer<typeof updateTreatmentSchema>;