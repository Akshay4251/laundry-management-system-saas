// app/hooks/use-add-order-items.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface AddItemInput {
  itemId: string;
  treatmentId: string;
  quantity: number;
  unitPrice: number;
  expressPrice?: number | null;
  notes?: string | null;
  color?: string | null;
  brand?: string | null;
}

interface AddItemsInput {
  orderId: string;
  items: AddItemInput[];
  isExpress?: boolean;
  transitionToInProgress?: boolean;
  deliveryDate?: string;
}

interface AddItemsResponse {
  success: boolean;
  data: {
    items: Array<{
      id: string;
      tagNumber: string;
      itemId: string;
      itemName: string;
      itemIcon: string | null;
      treatmentId: string;
      treatmentName: string;
      treatmentCode: string | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      status: string;
      isExpress: boolean;
      notes: string | null;
      color: string | null;
      brand: string | null;
    }>;
    order: {
      id: string;
      orderNumber: string;
      status: string;
      priority: string;
      totalAmount: number;
      tax: number;
      itemCount: number;
      deliveryDate: string | null;
    };
    transitioned: boolean;
  };
  message: string;
}

// ============================================================================
// API FUNCTION
// ============================================================================

async function addItemsToOrder({
  orderId,
  items,
  isExpress = false,
  transitionToInProgress = true,
  deliveryDate,
}: AddItemsInput): Promise<AddItemsResponse> {
  const response = await fetch(`/api/orders/${orderId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items,
      isExpress,
      transitionToInProgress,
      deliveryDate,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add items');
  }

  return response.json();
}

// ============================================================================
// HOOK
// ============================================================================

export function useAddOrderItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addItemsToOrder,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      
      toast.success(data.message || 'Items added successfully!');
    },
    onError: (error: Error) => {
      toast.error('Failed to add items', { description: error.message });
    },
  });
}