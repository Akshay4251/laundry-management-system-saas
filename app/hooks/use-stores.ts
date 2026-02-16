// app/hooks/use-stores.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Store } from '@/app/types';

// ============================================================================
// Query Keys
// ============================================================================

export const storeKeys = {
  all: ['stores'] as const,
  list: () => [...storeKeys.all, 'list'] as const,
  detail: (id: string) => [...storeKeys.all, 'detail', id] as const,
};

// ============================================================================
// API Functions
// ============================================================================

async function fetchStores(): Promise<Store[]> {
  const response = await fetch('/api/stores');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch stores');
  }
  
  const result = await response.json();
  return result.data || [];
}

interface CreateStoreInput {
  name: string;
  address?: string;
  phone?: string;
}

async function createStore(data: CreateStoreInput): Promise<Store> {
  const response = await fetch('/api/stores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create store');
  }
  
  const result = await response.json();
  return result.data;
}

// ============================================================================
// Hooks
// ============================================================================

export function useStores() {
  return useQuery({
    queryKey: storeKeys.list(),
    queryFn: fetchStores,
    staleTime: 60000, // 1 minute
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createStore,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      toast.success('Store created successfully', {
        description: `${data.name} has been added.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create store', {
        description: error.message,
      });
    },
  });
}