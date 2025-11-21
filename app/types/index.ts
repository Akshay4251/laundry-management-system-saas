// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole = 'owner' | 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// BUSINESS/TENANT TYPES
// ============================================================================

export interface Business {
  id: string;
  user_id: string;
  business_name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export interface Customer {
  id: string;
  business_id: string;
  full_name: string;
  email?: string;
  phone: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  turnaround_time: number;
  is_active: boolean;
  created_at: Date;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'ready' 
  | 'delivered' 
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Order {
  id: string;
  business_id: string;
  customer_id: string;
  customer?: Customer;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  pickup_date?: Date;
  delivery_date?: Date;
  notes?: string;
  items?: OrderItem[];
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_id: string;
  service?: Service;
  quantity: number;
  price: number;
  subtotal: number;
}

// ============================================================================
// STAFF TYPES
// ============================================================================

export interface Staff {
  id: string;
  business_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  role?: string;
  is_active: boolean;
  created_at: Date;
}

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeOrders: number;
  activeOrdersChange: number;
  pendingOrders: number;
  pendingOrdersChange: number;
  completedToday: number;
  completedTodayChange: number;
  totalCustomers: number;
  avgOrderValue: number;
  activeStaff: number;
  customerRating: number;
}

export interface RevenueDataPoint {
  day: string;
  revenue: number;
  date?: Date;
}

// ============================================================================
// FORM & UI TYPES
// ============================================================================

export interface CreateOrderFormData {
  customer_id: string;
  pickup_date?: Date;
  delivery_date?: Date;
  notes?: string;
  items: {
    service_id: string;
    quantity: number;
    price: number;
  }[];
}

export interface UpdateOrderFormData {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  paid_amount?: number;
  pickup_date?: Date;
  delivery_date?: Date;
  notes?: string;
}

export interface CreateCustomerFormData {
  full_name: string;
  email?: string;
  phone: string;
  address?: string;
}

export interface CreateServiceFormData {
  name: string;
  description?: string;
  price: number;
  unit: string;
  turnaround_time: number;
  is_active: boolean;
}

export interface CreateStaffFormData {
  full_name: string;
  email?: string;
  phone?: string;
  role?: string;
  is_active: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface OrderFilters {
  status?: OrderStatus[];
  payment_status?: PaymentStatus[];
  customer_id?: string;
  date_from?: Date;
  date_to?: Date;
  search?: string;
}

export interface CustomerFilters {
  search?: string;
  created_after?: Date;
  created_before?: Date;
}

export interface ServiceFilters {
  is_active?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
}

export interface StaffFilters {
  is_active?: boolean;
  role?: string;
  search?: string;
}

// ============================================================================
// TABLE & SORTING TYPES
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface BusinessSettings {
  business_id: string;
  currency: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export interface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  sidebar_collapsed: boolean;
  notifications_enabled: boolean;
  language: string;
}