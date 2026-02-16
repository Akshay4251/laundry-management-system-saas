// app/hooks/use-orders.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppContext } from '@/app/contexts/app-context';
import {
  OrderFilters,
  OrdersResponse,
  OrderDetailResponse,
  OrderStatus,
  PaymentMode,
  ItemStatus,
} from '@/app/types/order';

async function fetchOrders(filters: OrderFilters): Promise<OrdersResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`/api/orders?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch orders');
  }

  return response.json();
}

async function fetchOrderById(id: string): Promise<OrderDetailResponse> {
  const response = await fetch(`/api/orders/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch order');
  }

  return response.json();
}

async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  notes?: string,
  reason?: string,
  workshopPartnerName?: string,
  workshopNotes?: string
) {
  const response = await fetch(`/api/orders/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes, reason, workshopPartnerName, workshopNotes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update order status');
  }

  return response.json();
}

async function updateOrderItemsStatus(orderId: string, itemIds: string[], status: ItemStatus) {
  const response = await fetch(`/api/orders/${orderId}/items/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemIds, status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update item status');
  }

  return response.json();
}

async function sendItemsToWorkshop(
  orderId: string,
  itemIds: string[],
  workshopPartnerName?: string,
  workshopNotes?: string
) {
  const response = await fetch(`/api/orders/${orderId}/items/workshop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemIds, workshopPartnerName, workshopNotes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send items to workshop');
  }

  return response.json();
}

async function addPayment(
  orderId: string,
  data: {
    amount: number;
    mode: PaymentMode;
    reference?: string;
    notes?: string;
  }
) {
  const response = await fetch(`/api/orders/${orderId}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add payment');
  }

  return response.json();
}

async function cancelOrder(id: string) {
  const response = await fetch(`/api/orders/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel order');
  }

  return response.json();
}

async function fetchOrderStats(storeId?: string) {
  const params = storeId ? `?storeId=${storeId}` : '';
  const response = await fetch(`/api/orders/stats${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch order stats');
  }

  return response.json();
}

// ✅ NEW
async function assignDriver(orderId: string, driverId: string | null) {
  const response = await fetch(`/api/orders/${orderId}/assign-driver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign driver');
  }

  return response.json();
}

export function useOrders(filters: OrderFilters = {}) {
  const { selectedStoreId } = useAppContext();

  const finalFilters: OrderFilters = {
    ...filters,
    storeId: filters.storeId || selectedStoreId,
  };

  return useQuery({
    queryKey: ['orders', finalFilters],
    queryFn: () => fetchOrders(finalFilters),
    enabled: !!finalFilters.storeId,
    staleTime: 30000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
    staleTime: 10000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
      reason,
      workshopPartnerName,
      workshopNotes,
    }: {
      id: string;
      status: OrderStatus;
      notes?: string;
      reason?: string;
      workshopPartnerName?: string;
      workshopNotes?: string;
    }) => updateOrderStatus(id, status, notes, reason, workshopPartnerName, workshopNotes),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      queryClient.invalidateQueries({ queryKey: ['workshop'] });
      toast.success(data.message || 'Order status updated!');
    },
    onError: (error: Error) => {
      toast.error('Failed to update status', { description: error.message });
    },
  });
}

export function useUpdateOrderItemsStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemIds, status }: { orderId: string; itemIds: string[]; status: ItemStatus }) =>
      updateOrderItemsStatus(orderId, itemIds, status),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['workshop'] });
      toast.success('Items updated!');
    },
    onError: (error: Error) => {
      toast.error('Failed to update items', { description: error.message });
    },
  });
}

export function useSendItemsToWorkshop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      itemIds,
      workshopPartnerName,
      workshopNotes,
    }: {
      orderId: string;
      itemIds: string[];
      workshopPartnerName?: string;
      workshopNotes?: string;
    }) => sendItemsToWorkshop(orderId, itemIds, workshopPartnerName, workshopNotes),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      queryClient.invalidateQueries({ queryKey: ['workshop'] });
      toast.success(data.message || 'Items sent to workshop!');
    },
    onError: (error: Error) => {
      toast.error('Failed to send items to workshop', { description: error.message });
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, ...data }: { orderId: string } & Parameters<typeof addPayment>[1]) =>
      addPayment(orderId, data),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Payment recorded!', { description: `₹${data.data.payment.amount} added` });
    },
    onError: (error: Error) => {
      toast.error('Failed to add payment', { description: error.message });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Order cancelled');
    },
    onError: (error: Error) => {
      toast.error('Failed to cancel order', { description: error.message });
    },
  });
}

export function useOrderStats() {
  const { selectedStoreId } = useAppContext();

  return useQuery({
    queryKey: ['orderStats', selectedStoreId],
    queryFn: () => fetchOrderStats(selectedStoreId),
    enabled: !!selectedStoreId,
    refetchInterval: 60000,
  });
}

// ✅ NEW
export function useAssignDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string | null }) =>
      assignDriver(orderId, driverId),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success(data.message || 'Driver updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update driver', { description: error.message });
    },
  });
}

export type { OrderFilters };