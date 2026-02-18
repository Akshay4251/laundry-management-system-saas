// app/hooks/use-items.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { 
  Item, 
  ItemWithPricing, 
  ItemStats, 
  ItemFilters, 
  CreateItemInput, 
  UpdateItemInput 
} from '@/app/types/item';
import type { Service } from '@/app/types/service';

// ============================================================================
// Query Keys
// ============================================================================

export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters: ItemFilters) => [...itemKeys.lists(), filters] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
};

// ============================================================================
// Hook: useItems - List items with filters
// ============================================================================

interface UseItemsReturn {
  items: Item[];
  services: Service[];
  stats: ItemStats | undefined;
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

export function useItems(filters: ItemFilters = {}): UseItemsReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: itemKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.set('search', filters.search);
      if (filters.category && filters.category !== 'all') {
        params.set('category', filters.category.toUpperCase());
      }
      if (filters.activeOnly) params.set('activeOnly', 'true');
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`/api/items?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch items');
      }

      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: itemKeys.all });
  };

  return {
    items: (query.data?.data?.items || []) as Item[],
    services: (query.data?.data?.services || []) as Service[],
    stats: query.data?.data?.stats as ItemStats | undefined,
    pagination: query.data?.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
  };
}

// ============================================================================
// Hook: useSingleItem - Get single item with all pricing
// ============================================================================

export function useSingleItem(id: string | null) {
  return useQuery({
    queryKey: itemKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const response = await fetch(`/api/items/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch item');
      }

      return response.json();
    },
    enabled: !!id,
  });
}

// ============================================================================
// Hook: useCreateItem - Create item with inline pricing
// ============================================================================

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateItemInput) => {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create item');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      toast.success(data.message || 'Item created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useUpdateItem - Update item with inline pricing
// ============================================================================

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateItemInput }) => {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update item');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      toast.success(data.message || 'Item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useDeleteItem - Delete item
// ============================================================================

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete item');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      toast.success(data.message || 'Item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================================================
// Hook: useToggleItem - Toggle item active status
// ============================================================================

export function useToggleItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/items/${id}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle item status');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}