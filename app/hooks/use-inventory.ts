// app/hooks/use-inventory.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  InventoryItemWithStats,
  InventoryFilters,
  CreateInventoryInput,
  UpdateInventoryInput,
  RestockInput,
  StockAdjustmentInput,
  PaginatedInventory,
  InventoryStats,
  AdjustmentReason,
} from '@/app/types/inventory';

// ============================================================================
// Query Keys
// ============================================================================

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: InventoryFilters) => [...inventoryKeys.lists(), filters] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  stats: () => [...inventoryKeys.all, 'stats'] as const,
};

// ============================================================================
// API Functions
// ============================================================================

async function fetchInventory(filters: InventoryFilters): Promise<PaginatedInventory> {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.lowStockOnly) params.set('lowStockOnly', 'true');
  if (filters.storeId) params.set('storeId', filters.storeId);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.includeDeleted) params.set('includeDeleted', 'true');

  const response = await fetch(`/api/inventory?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch inventory');
  }

  const result = await response.json();
  return result.data;
}

async function fetchInventoryItem(id: string): Promise<InventoryItemWithStats> {
  const response = await fetch(`/api/inventory/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch inventory item');
  }

  const result = await response.json();
  return result.data.item;
}

async function fetchInventoryStats(): Promise<InventoryStats> {
  const response = await fetch('/api/inventory/stats');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch inventory stats');
  }

  const result = await response.json();
  return result.data.stats;
}

async function createInventoryItem(data: CreateInventoryInput): Promise<InventoryItemWithStats> {
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create inventory item');
  }

  const result = await response.json();
  return result.data.item;
}

async function updateInventoryItem(
  id: string,
  data: UpdateInventoryInput
): Promise<InventoryItemWithStats> {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update inventory item');
  }

  const result = await response.json();
  return result.data.item;
}

async function deleteInventoryItem(id: string): Promise<void> {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete inventory item');
  }
}

async function restockInventoryItem(
  id: string,
  data: RestockInput
): Promise<InventoryItemWithStats> {
  const response = await fetch(`/api/inventory/${id}/restock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to restock item');
  }

  const result = await response.json();
  return result.data.item;
}

async function adjustInventoryStock(
  id: string,
  data: StockAdjustmentInput
): Promise<{ 
  item: InventoryItemWithStats; 
  adjustment: { 
    type: string; 
    quantity: number; 
    reason: string;
    previousStock: number; 
    newStock: number;
  };
}> {
  const response = await fetch(`/api/inventory/${id}/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to adjust stock');
  }

  const result = await response.json();
  return result.data;
}

// ============================================================================
// Hooks
// ============================================================================

export function useInventory(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: () => fetchInventory(filters),
    staleTime: 30000,
  });
}

export function useInventoryItem(id: string | null) {
  return useQuery({
    queryKey: inventoryKeys.detail(id || ''),
    queryFn: () => fetchInventoryItem(id!),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useInventoryStats() {
  return useQuery({
    queryKey: inventoryKeys.stats(),
    queryFn: fetchInventoryStats,
    staleTime: 60000,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInventoryItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Item created successfully', {
        description: `${data.name} has been added to inventory.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create item', {
        description: error.message,
      });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryInput }) =>
      updateInventoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Item updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update item', {
        description: error.message,
      });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete item', {
        description: error.message,
      });
    },
  });
}

export function useRestockInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RestockInput }) =>
      restockInventoryItem(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Stock updated successfully', {
        description: `${data.name} now has ${data.currentStock} ${data.unit} in stock.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to restock item', {
        description: error.message,
      });
    },
  });
}

export function useAdjustInventoryStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StockAdjustmentInput }) =>
      adjustInventoryStock(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      
      const { adjustment, item } = result;
      
      if (adjustment.type === 'ADD') {
        toast.success('Stock added successfully', {
          description: `Added ${adjustment.quantity} ${item.unit} to ${item.name}. New stock: ${adjustment.newStock}`,
        });
      } else {
        toast.success('Stock removed successfully', {
          description: `Removed ${adjustment.quantity} ${item.unit} from ${item.name}. New stock: ${adjustment.newStock}`,
        });
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to adjust stock', {
        description: error.message,
      });
    },
  });
}

// ============================================================================
// Re-export types
// ============================================================================

export type {
  InventoryItemWithStats,
  InventoryFilters,
  CreateInventoryInput,
  UpdateInventoryInput,
  RestockInput,
  StockAdjustmentInput,
  InventoryStats,
  AdjustmentReason,
};