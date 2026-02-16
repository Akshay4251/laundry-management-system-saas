// app/types/super-admin.ts

// ============================================================================
// SUPER ADMIN DASHBOARD STATS
// ============================================================================

export interface SuperAdminStats {
  businesses: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
  };
  users: {
    total: number;
    owners: number;
    admins: number;
    staff: number;
  };
  orders: {
    total: number;
    thisMonth: number;
  };
  planDistribution: {
    trial: number;
    basic: number;
    professional: number;
    enterprise: number;
  };
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface SuperAdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
  businessId: string | null;
  business: {
    id: string;
    businessName: string;
    planType: string;
    planStatus: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// BUSINESS TYPES
// ============================================================================

export interface SuperAdminBusiness {
  id: string;
  businessName: string;
  email: string | null;
  phone: string | null;
  planType: string;
  planStatus: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  } | null;
  settings: {
    id: string;
    pickupEnabled: boolean;
    deliveryEnabled: boolean;
    workshopEnabled: boolean;
    multiStoreEnabled: boolean;
  } | null;
  _count: {
    stores: number;
    customers: number;
    orders: number;
    staff: number;
  };
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export interface SubscriptionBusiness {
  id: string;
  businessName: string;
  planType: string;
  planStatus: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  createdAt: string;
  user: {
    email: string;
    fullName: string;
  } | null;
  _count: {
    orders: number;
    stores: number;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}