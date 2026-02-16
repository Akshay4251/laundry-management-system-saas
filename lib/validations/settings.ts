// lib/validations/settings.ts

import { z } from 'zod';

// ============================================================================
// BUSINESS SETTINGS
// ============================================================================

export const businessSettingsSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().nullable(),
  address: z.string().optional().nullable(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;

// ============================================================================
// PROFILE
// ============================================================================

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ============================================================================
// PASSWORD
// ============================================================================

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;

// ============================================================================
// USER PREFERENCES
// ============================================================================

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
  compactMode: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  notifyNewOrders: z.boolean().optional(),
  notifyOrderComplete: z.boolean().optional(),
  notifyLowStock: z.boolean().optional(),
  notifyMarketing: z.boolean().optional(),
});

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;