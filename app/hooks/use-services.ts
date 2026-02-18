// app/hooks/use-services.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { 
  Service, 
  ServiceStats, 
  ServiceFilters, 
  CreateServiceInput, 
  UpdateServiceInput 
} from '@/app/types/service';

// ============================================================================
// Query Keys
// ============================================================================

export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters: ServiceFilters) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
};

// ============================================================================
// Hook: useServices - List services
// ============================================================================

interface UseServicesReturn {
  services: Service[];
  stats: ServiceStats | undefined;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useServices(filters: ServiceFilters = {}): UseServicesReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.set('search', filters.search);
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

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: serviceKeys.all });
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
// Hook: useSingleService - Get single service with item prices
// ============================================================================

export function useSingleService(id: string | null) {
  return useQuery({
    queryKey: serviceKeys.detail(id || ''),
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

// ============================================================================
// Hook: useCreateService - Create service
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
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      // Also invalidate items as they need to show the new service
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(data.message || 'Service created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useUpdateService - Update service
// ============================================================================

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateServiceInput }) => {
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
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(data.message || 'Service updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useDeleteService - Delete service
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
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(data.message || 'Service deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useToggleService - Toggle service active status
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
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useActiveServices - Get only active services (for order creation)
// ============================================================================

export function useActiveServices() {
  return useServices({ activeOnly: true });
}