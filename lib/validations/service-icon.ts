import { z } from 'zod';
import { ItemCategory } from '@prisma/client';

export const createServiceIconSchema = z.object({
  name: z
    .string()
    .min(2, 'Icon name must be at least 2 characters')
    .max(100, 'Icon name is too long')
    .trim(),

  imageUrl: z
    .string()
    .url('Invalid URL format'),

  category: z.nativeEnum(ItemCategory),

  tags: z
    .array(z.string())
    .optional()
    .default([]),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),

  isPremium: z.boolean().optional().default(false),

  isActive: z.boolean().optional().default(true),
});

export type CreateServiceIconInput = z.infer<typeof createServiceIconSchema>;