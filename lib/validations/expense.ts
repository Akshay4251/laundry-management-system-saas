// lib/validations/expense.ts

import { z } from "zod";

// ============= Expense Category Enum =============
export const expenseCategoryEnum = z.enum([
  "UTILITIES",
  "SUPPLIES",
  "MAINTENANCE",
  "SALARIES",
  "MARKETING",
  "RENT",
  "EQUIPMENT",
  "OTHER",
]);

// ============= Payment Method Enum =============
export const expensePaymentMethodEnum = z.enum([
  "CASH",
  "CARD",
  "UPI",
  "BANK_TRANSFER",
]);

// ============= Create Expense Schema =============
export const createExpenseSchema = z.object({
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(255, "Description is too long")
    .trim(),

  category: expenseCategoryEnum,

  amount: z
    .number()
    .positive("Amount must be positive")
    .max(10000000, "Amount is too large"),

  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),

  paymentMethod: expensePaymentMethodEnum,

  vendor: z
    .string()
    .max(100, "Vendor name is too long")
    .optional()
    .nullable()
    .or(z.literal("")),

  receipt: z
    .string()
    .max(255, "Receipt reference is too long")
    .optional()
    .nullable()
    .or(z.literal("")),

  notes: z
    .string()
    .max(1000, "Notes are too long")
    .optional()
    .nullable()
    .or(z.literal("")),

  storeId: z
    .string()
    .optional()
    .nullable(),
});

// ============= Update Expense Schema =============
export const updateExpenseSchema = createExpenseSchema.partial();

// ============= Query Parameters Schema =============
export const expenseQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),

  category: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),

  dateRange: z
    .enum(["all", "today", "week", "month", "quarter", "year"])
    .optional()
    .nullable()
    .default("all")
    .transform((val) => val || "all"),

  startDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),

  endDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),

  paymentMethod: z
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
    .default("50")
    .transform((val) => parseInt(val || "50", 10))
    .pipe(z.number().int().min(1).max(100)),

  sortBy: z
    .enum(["date", "amount", "createdAt"])
    .optional()
    .nullable()
    .default("date")
    .transform((val) => val || "date"),

  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .nullable()
    .default("desc")
    .transform((val) => val || "desc"),
});

// ============= Type Exports =============
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryParams = z.infer<typeof expenseQuerySchema>;