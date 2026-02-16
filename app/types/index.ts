// app/types/index.ts
// ============================================================================
// MASTER TYPE EXPORTS - Consolidated & Clean
// ============================================================================

// Re-export all types from specialized files
export * from './order';
export * from './item';
export * from './treatment';
export * from './customer';
export * from './notification';
export * from './settings';
export * from './super-admin';

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  businessId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// BUSINESS TYPES
// ============================================================================

export type BusinessPlan = 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
export type PlanStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';

export interface Business {
  id: string;
  businessName: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  planType: BusinessPlan;
  planStatus: PlanStatus;
  trialEndsAt?: string | null;
  subscriptionEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  id: string;
  businessId: string;
  workshopEnabled: boolean;
  multiStoreEnabled: boolean;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  maxStores: number;
  maxStaff: number;
  maxMonthlyOrders: number;
  smsNotifications: boolean;
  emailNotifications: boolean;
  whatsappIntegration: boolean;
  advancedReports: boolean;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  expressMultiplier: number;
}

export interface BusinessWithSettings extends Business {
  settings: BusinessSettings | null;
  _count?: {
    stores: number;
    customers: number;
    orders: number;
    staff: number;
  };
}

// ============================================================================
// STORE TYPES
// ============================================================================

export interface Store {
  id: string;
  businessId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// STAFF TYPES
// ============================================================================

export interface Staff {
  id: string;
  businessId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  activeCustomers: number;
  customersChange: number;
  pendingOrders: number;
  pendingChange: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}