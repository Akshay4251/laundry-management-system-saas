// app/hooks/use-treatments.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { 
  Treatment, 
  TreatmentStats, 
  TreatmentFilters, 
  CreateTreatmentInput, 
  UpdateTreatmentInput 
} from '@/app/types/treatment';

// ============================================================================
// Query Keys
// ============================================================================

export const treatmentKeys = {
  all: ['treatments'] as const,
  lists: () => [...treatmentKeys.all, 'list'] as const,
  list: (filters: TreatmentFilters) => [...treatmentKeys.lists(), filters] as const,
  details: () => [...treatmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...treatmentKeys.details(), id] as const,
};

// ============================================================================
// Hook: useTreatments - List treatments
// ============================================================================

interface UseTreatmentsReturn {
  treatments: Treatment[];
  stats: TreatmentStats | undefined;
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

export function useTreatments(filters: TreatmentFilters = {}): UseTreatmentsReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: treatmentKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.set('search', filters.search);
      if (filters.activeOnly) params.set('activeOnly', 'true');
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`/api/treatments?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch treatments');
      }

      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: treatmentKeys.all });
  };

  return {
    treatments: (query.data?.data?.treatments || []) as Treatment[],
    stats: query.data?.data?.stats as TreatmentStats | undefined,
    pagination: query.data?.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
  };
}

// ============================================================================
// Hook: useSingleTreatment - Get single treatment with item prices
// ============================================================================

export function useSingleTreatment(id: string | null) {
  return useQuery({
    queryKey: treatmentKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const response = await fetch(`/api/treatments/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch treatment');
      }

      return response.json();
    },
    enabled: !!id,
  });
}

// ============================================================================
// Hook: useCreateTreatment - Create treatment
// ============================================================================

export function useCreateTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTreatmentInput) => {
      const response = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create treatment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: treatmentKeys.all });
      // Also invalidate items as they need to show the new treatment
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(data.message || 'Treatment created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useUpdateTreatment - Update treatment
// ============================================================================

export function useUpdateTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTreatmentInput }) => {
      const response = await fetch(`/api/treatments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update treatment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: treatmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(data.message || 'Treatment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useDeleteTreatment - Delete treatment
// ============================================================================

export function useDeleteTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/treatments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete treatment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: treatmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(data.message || 'Treatment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useToggleTreatment - Toggle treatment active status
// ============================================================================

export function useToggleTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/treatments/${id}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle treatment status');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: treatmentKeys.all });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useActiveTreatments - Get only active treatments (for order creation)
// ============================================================================

export function useActiveTreatments() {
  return useTreatments({ activeOnly: true });
}