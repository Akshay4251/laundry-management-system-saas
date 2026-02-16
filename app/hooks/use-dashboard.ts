// app/hooks/use-dashboard.ts

import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '@/app/contexts/app-context'; 
import type { DashboardResponse, TimeRange } from '@/app/types/dashboard';

async function fetchDashboardStats(
  storeId: string,
  timeRange: TimeRange
): Promise<DashboardResponse> {
  const params = new URLSearchParams();
  params.append('storeId', storeId);
  params.append('timeRange', timeRange);

  const response = await fetch(`/api/dashboard/stats?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch dashboard stats');
  }

  return response.json();
}

export function useDashboardStats(timeRange: TimeRange = 'week') {
  const { selectedStoreId } = useAppContext(); // Fixed

  return useQuery({
    queryKey: ['dashboard-stats', selectedStoreId, timeRange],
    queryFn: () => fetchDashboardStats(selectedStoreId!, timeRange),
    enabled: !!selectedStoreId,
    staleTime: 60000,
    refetchInterval: 5 * 60000,
  });
}