// app/types/api.ts
import { Customer, Order, OrderItem, Payment, Service } from "@prisma/client";

// ============= Customer Types =============
export type CustomerWithStats = Customer & {
  _count?: {
    orders: number;
  };
};

export type CustomerWithOrders = Customer & {
  orders: (Order & {
    items: OrderItem[];
    payment: Payment | null;
  })[];
};

// ============= Order Types =============
export type OrderWithRelations = Order & {
  customer: Customer;
  items: (OrderItem & {
    service: Service;
  })[];
  payment: Payment | null;
  assignedTo?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

// ============= API Response Types =============
export type ApiError = {
  error: string;
  message: string;
  details?: unknown;
  field?: string;
};

export type ApiSuccess<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

// ============= Specific Response Types =============
export type CustomerCreatedResponse = {
  customer: Customer;
  message: string;
};

export type OrderCreatedResponse = {
  order: OrderWithRelations;
  orderNumber: string;
  totalAmount: number;
};