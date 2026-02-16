// lib/validations/customer.ts
import { z } from "zod";

// Phone validation regex (supports various formats)
const phoneRegex = /^[\d\s\-\+\(\)]+$/;

// ============= Create Customer Schema =============
export const createCustomerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim(),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number is too long")
    .regex(phoneRegex, "Invalid phone number format")
    .transform((val) => val.replace(/[\s\-\(\)]/g, "")), // Remove formatting

  email: z
    .string()
    .email("Invalid email format")
    .max(255)
    .optional()
    .nullable()
    .or(z.literal("")),

  address: z
    .string()
    .max(500, "Address is too long")
    .optional()
    .nullable()
    .or(z.literal("")),

  // NEW optional fields
  notes: z
    .string()
    .max(1000, "Notes are too long")
    .optional()
    .nullable()
    .or(z.literal("")),

  tags: z
    .array(z.string().max(50))
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .default([]),
});

// ============= Update Customer Schema =============
export const updateCustomerSchema = createCustomerSchema.partial();

// ============= Query Parameters Schema (FIXED) =============
export const customerQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  
  page: z
    .string()
    .optional()
    .nullable()
    .default("1")
    .transform((val) => parseInt(val || "1", 10))
    .pipe(z.number().int().positive()),
  
  limit: z
    .string()
    .optional()
    .nullable()
    .default("20")
    .transform((val) => parseInt(val || "20", 10))
    .pipe(z.number().int().min(1).max(100)),
  
  sortBy: z
    .enum(["fullName", "createdAt", "phone", "lastOrderDate", "totalOrders", "totalSpent"])
    .optional()
    .nullable()
    .default("createdAt")
    .transform((val) => val || "createdAt"),
  
  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .nullable()
    .default("desc")
    .transform((val) => val || "desc"),
  
  tags: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  
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
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerQueryParams = z.infer<typeof customerQuerySchema>;