// app/hooks/use-expenses.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  Expense,
  ExpenseFilters,
  CreateExpenseInput,
  UpdateExpenseInput,
  PaginatedExpenses,
  ExpenseStats,
} from '@/app/types/expense';

// ============================================================================
// Query Keys
// ============================================================================

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: ExpenseFilters) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  stats: (dateRange?: string) => [...expenseKeys.all, 'stats', dateRange] as const,
};

// ============================================================================
// API Functions
// ============================================================================

async function fetchExpenses(filters: ExpenseFilters): Promise<PaginatedExpenses> {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.dateRange && filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.paymentMethod && filters.paymentMethod !== 'all') params.set('paymentMethod', filters.paymentMethod);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const response = await fetch(`/api/expenses?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch expenses');
  }

  const result = await response.json();
  return result.data;
}

async function fetchExpenseById(id: string): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch expense');
  }

  const result = await response.json();
  return result.data.expense;
}

async function fetchExpenseStats(dateRange?: string): Promise<ExpenseStats> {
  const params = new URLSearchParams();
  if (dateRange) params.set('dateRange', dateRange);

  const response = await fetch(`/api/expenses/stats?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch expense stats');
  }

  const result = await response.json();
  return result.data.stats;
}

async function createExpense(data: CreateExpenseInput): Promise<Expense> {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create expense');
  }

  const result = await response.json();
  return result.data.expense;
}

async function updateExpense(id: string, data: UpdateExpenseInput): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update expense');
  }

  const result = await response.json();
  return result.data.expense;
}

async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete expense');
  }
}

// ============================================================================
// Hooks
// ============================================================================

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => fetchExpenses(filters),
    staleTime: 30000,
  });
}

export function useExpense(id: string | null) {
  return useQuery({
    queryKey: expenseKeys.detail(id || ''),
    queryFn: () => fetchExpenseById(id!),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useExpenseStats(dateRange?: string) {
  return useQuery({
    queryKey: expenseKeys.stats(dateRange),
    queryFn: () => fetchExpenseStats(dateRange),
    staleTime: 60000,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success('Expense added successfully', {
        description: `₹${data.amount.toLocaleString('en-IN')} - ${data.description}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to add expense', {
        description: error.message,
      });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) =>
      updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success('Expense updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update expense', {
        description: error.message,
      });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success('Expense deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete expense', {
        description: error.message,
      });
    },
  });
}

// ============================================================================
// Re-export types
// ============================================================================

export type {
  Expense,
  ExpenseFilters,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseStats,
};