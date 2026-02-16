// app/hooks/use-services.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
export interface Service {
  id: string;
  name: string;
  description?: string | null;
  category: 'GARMENT' | 'HOUSEHOLD' | 'SPECIALTY';
  iconUrl?: string | null; // ✅ Only iconUrl, no Lucide fields
  basePrice: number;
  expressPrice: number | null;
  unit: string;
  turnaroundTime: number;
  serviceTypes: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
}

export interface ServiceFilters {
  storeId?: string;
  search?: string;
  category?: string;
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateServiceInput {
  name: string;
  description?: string | null;
  category: 'GARMENT' | 'HOUSEHOLD' | 'SPECIALTY';
  iconUrl?: string | null; // ✅ Only iconUrl
  basePrice: number;
  expressPrice?: number | null;
  unit?: string;
  turnaroundTime?: number;
  serviceTypes?: string[];
  isActive?: boolean;
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {}

// ============================================================================
// Main Hook: useServices
// ============================================================================
export function useServices(filters: ServiceFilters = {}) {
  const queryClient = useQueryClient();

  // Fetch services
  const query = useQuery({
    queryKey: ['services', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.storeId) params.set('storeId', filters.storeId);
      if (filters.search) params.set('search', filters.search);
      if (filters.category && filters.category !== 'all') {
        params.set('category', filters.category.toUpperCase());
      }
      if (filters.activeOnly) params.set('activeOnly', 'true');
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`/api/services?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch services');
      }

      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });

  // Invalidate and refetch
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };

  return {
    services: (query.data?.data?.services || []) as Service[],
    stats: query.data?.data?.stats as ServiceStats | undefined,
    pagination: query.data?.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
  };
}

// ============================================================================
// Hook: useCreateService
// ============================================================================
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateServiceInput) => {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create service');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(data.message || 'Service created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useUpdateService
// ============================================================================
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateServiceInput;
    }) => {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update service');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(data.message || 'Service updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useDeleteService
// ============================================================================
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete service');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(data.message || 'Service deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useToggleService
// ============================================================================
export function useToggleService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/services/${id}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle service status');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useSingleService
// ============================================================================
export function useSingleService(id: string | null) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) return null;

      const response = await fetch(`/api/services/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch service');
      }

      return response.json();
    },
    enabled: !!id,
  });
}