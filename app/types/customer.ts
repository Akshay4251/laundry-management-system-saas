// app/types/customer.ts

export interface Customer {
  id: string;
  businessId: string;
  fullName: string;
  email?: string | null;
  phone: string;
  address?: string | null;
  notes?: string | null;
  tags: string[];
  lastOrderDate?: string | null;
  totalOrders: number;
  totalSpent: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWithStats extends Customer {
  _count?: {
    orders: number;
  };
}

export interface CustomerWithOrders extends Customer {
  orders: any[];
  _count: {
    orders: number;
  };
}

export interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'fullName' | 'createdAt' | 'phone' | 'lastOrderDate' | 'totalOrders' | 'totalSpent';
  sortOrder?: 'asc' | 'desc';
  tags?: string;
  includeDeleted?: boolean;
}

export interface CreateCustomerInput {
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  tags?: string[];
}

export interface UpdateCustomerInput {
  fullName?: string;
  phone?: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  tags?: string[];
}

export interface PaginatedCustomers {
  data: CustomerWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}