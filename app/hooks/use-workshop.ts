// app/hooks/use-workshop.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppContext } from '@/app/contexts/app-context';
import { WorkshopItem, WorkshopStats } from '@/app/types/order';

interface WorkshopResponse {
  success: boolean;
  data: {
    items: WorkshopItem[];
    stats: WorkshopStats;
  };
}

type WorkshopTab = 'processing' | 'ready' | 'history';

async function fetchWorkshopItems(storeId?: string, tab?: WorkshopTab): Promise<WorkshopResponse> {
  const params = new URLSearchParams();
  if (storeId) params.append('storeId', storeId);
  if (tab) params.append('tab', tab);

  const response = await fetch(`/api/workshop?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch workshop items');
  }
  return response.json();
}

async function updateWorkshopItem(
  itemId: string, 
  action: 'mark_returned' | 'mark_ready' | 'return_to_store', 
  notes?: string
) {
  const response = await fetch(`/api/workshop/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, notes }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update workshop item');
  }
  return response.json();
}

export function useWorkshopItems(tab?: WorkshopTab) {
  const { selectedStoreId } = useAppContext();

  return useQuery({
    queryKey: ['workshop', selectedStoreId, tab],
    queryFn: () => fetchWorkshopItems(selectedStoreId, tab),
    enabled: !!selectedStoreId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useUpdateWorkshopItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      itemId, 
      action, 
      notes 
    }: { 
      itemId: string; 
      action: 'mark_returned' | 'mark_ready' | 'return_to_store'; 
      notes?: string 
    }) => updateWorkshopItem(itemId, action, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workshop'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error('Failed to update item', {
        description: error.message,
      });
    },
  });
}