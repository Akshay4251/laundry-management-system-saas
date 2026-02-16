// app/types/dashboard.ts

import { OrderStatus } from './order';

export interface DashboardStats {
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  orders: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  customers: {
    active: number;
    change: number;
    trend: 'up' | 'down';
  };
  pending: {
    count: number;
    change: number;
    trend: 'up' | 'down';
  };
}

export interface DashboardQuickStats {
  todayPickups: number;
  todayDeliveries: number;
  pendingActions: number;
}

export interface RevenueDataPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusDistribution {
  status: OrderStatus;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName: string;
    phone: string;
  };
  itemCount: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  quickStats: DashboardQuickStats;
  revenueChart: RevenueDataPoint[];
  statusDistribution: OrderStatusDistribution[];
  recentOrders: RecentOrder[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export type TimeRange = 'week' | 'month' | 'year';