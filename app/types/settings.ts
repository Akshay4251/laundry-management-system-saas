// app/types/settings.ts

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  timeFormat: string;
  compactMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notifyNewOrders: boolean;
  notifyOrderComplete: boolean;
  notifyLowStock: boolean;
  notifyMarketing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  ipAddress?: string | null;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
  isCurrent?: boolean;
}

export interface ProfileUpdateData {
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface BusinessSettingsUpdateData {
  businessName?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  currency?: string;
  timezone?: string;
}

export interface StoreWithStats {
  id: string;
  businessId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed stats
  ordersCount: number;
  monthlyRevenue: number;
  status: 'active' | 'maintenance' | 'closed';
}