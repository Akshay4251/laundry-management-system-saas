// app/hooks/use-super-admin.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  SuperAdminStats,
  SuperAdminBusiness,
  SuperAdminUser,
  SubscriptionBusiness,
  PaginatedResponse,
} from '@/app/types/super-admin';

// ============================================================================
// STATS
// ============================================================================

export function useSuperAdminStats() {
  return useQuery<SuperAdminStats>({
    queryKey: ['super-admin', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/super-admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 60000,
  });
}

// ============================================================================
// USERS
// ============================================================================

interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
}

export function useSuperAdminUsers(filters: UserFilters = {}) {
  return useQuery<PaginatedResponse<SuperAdminUser>>({
    queryKey: ['super-admin', 'users', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.role && filters.role !== 'all') params.set('role', filters.role);
      if (filters.page) params.set('page', filters.page.toString());

      const res = await fetch(`/api/super-admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const json = await res.json();
      return { items: json.data.users, pagination: json.data.pagination };
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'stats'] });
      toast.success('User deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const res = await fetch(`/api/super-admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error('Failed to reset password');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: () => {
      toast.error('Failed to reset password');
    },
  });
}

// ============================================================================
// BUSINESSES
// ============================================================================

interface BusinessFilters {
  search?: string;
  page?: number;
}

export function useSuperAdminBusinesses(filters: BusinessFilters = {}) {
  return useQuery<PaginatedResponse<SuperAdminBusiness>>({
    queryKey: ['super-admin', 'businesses', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.page) params.set('page', filters.page.toString());

      const res = await fetch(`/api/super-admin/businesses?${params}`);
      if (!res.ok) throw new Error('Failed to fetch businesses');
      const json = await res.json();
      return { items: json.data.businesses, pagination: json.data.pagination };
    },
  });
}

export function useUpdateBusinessFeatures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      features,
    }: {
      businessId: string;
      features: {
        pickupEnabled?: boolean;
        deliveryEnabled?: boolean;
        workshopEnabled?: boolean;
        multiStoreEnabled?: boolean;
      };
    }) => {
      const res = await fetch(`/api/super-admin/businesses/${businessId}/features`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
      });
      if (!res.ok) throw new Error('Failed to update features');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'businesses'] });
      toast.success('Features updated');
    },
    onError: () => {
      toast.error('Failed to update features');
    },
  });
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

interface SubscriptionFilters {
  plan?: string;
  status?: string;
  page?: number;
}

export function useSuperAdminSubscriptions(filters: SubscriptionFilters = {}) {
  return useQuery<PaginatedResponse<SubscriptionBusiness>>({
    queryKey: ['super-admin', 'subscriptions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.plan && filters.plan !== 'all') params.set('plan', filters.plan);
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.page) params.set('page', filters.page.toString());

      const res = await fetch(`/api/super-admin/subscriptions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      const json = await res.json();
      return { items: json.data.subscriptions, pagination: json.data.pagination };
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      planType,
      planStatus,
    }: {
      businessId: string;
      planType?: string;
      planStatus?: string;
    }) => {
      const res = await fetch(`/api/super-admin/businesses/${businessId}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, planStatus }),
      });
      if (!res.ok) throw new Error('Failed to update subscription');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'stats'] });
      toast.success('Subscription updated');
    },
    onError: () => {
      toast.error('Failed to update subscription');
    },
  });
}