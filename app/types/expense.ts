// app/types/expense.ts

export type ExpenseCategory = 
  | 'UTILITIES' 
  | 'SUPPLIES' 
  | 'MAINTENANCE' 
  | 'SALARIES' 
  | 'MARKETING' 
  | 'RENT'
  | 'EQUIPMENT'
  | 'OTHER';

export type ExpensePaymentMethod = 
  | 'CASH' 
  | 'CARD' 
  | 'UPI' 
  | 'BANK_TRANSFER';

export interface Expense {
  id: string;
  businessId: string;
  storeId: string | null;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: ExpensePaymentMethod;
  vendor: string | null;
  receipt: string | null;
  notes: string | null;
  createdBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  search?: string;
  category?: ExpenseCategory | 'all';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  paymentMethod?: ExpensePaymentMethod | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateExpenseInput {
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: ExpensePaymentMethod;
  vendor?: string | null;
  receipt?: string | null;
  notes?: string | null;
  storeId?: string | null;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}

export interface PaginatedExpenses {
  data: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ExpenseStats {
  totalAmount: number;
  count: number;
  byCategory: Record<ExpenseCategory, number>;
  byPaymentMethod: Record<ExpensePaymentMethod, number>;
}