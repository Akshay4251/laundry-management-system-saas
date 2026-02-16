// app/hooks/use-global-search.ts

'use client';

import { useQuery } from '@tanstack/react-query';

export type GlobalSearchResult = {
  id: string;
  type: 'order' | 'customer';
  title: string;
  subtitle?: string;
  href: string;
  badge: 'Order' | 'Customer';
};

type GlobalSearchResponse = {
  results: GlobalSearchResult[];
};

async function fetchGlobalSearch(query: string, storeId?: string): Promise<GlobalSearchResult[]> {
  const params = new URLSearchParams({ q: query });
  if (storeId) params.append('storeId', storeId);

  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to search');
  }
  const data: { data: GlobalSearchResponse } = await res.json();
  return data.data.results;
}

export function useGlobalSearch(query: string, storeId?: string) {
  return useQuery({
    queryKey: ['global-search', query, storeId],
    queryFn: () => fetchGlobalSearch(query, storeId),
    enabled: query.length >= 2,
    staleTime: 10_000,
  });
}