'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface ServiceIcon {
  id: string;
  name: string;
  imageUrl: string;
  category: 'GARMENT' | 'HOUSEHOLD' | 'SPECIALTY';
  tags: string[];
}

export interface GroupedIcons {
  GARMENT?: ServiceIcon[];
  HOUSEHOLD?: ServiceIcon[];
  SPECIALTY?: ServiceIcon[];
}

interface ServiceIconsResponse {
  icons: ServiceIcon[];
  grouped: GroupedIcons;
  total: number;
}

// Fetch all predefined icons
export function useServiceIcons(category?: string) {
  return useQuery({
    queryKey: ['service-icons', category],
    queryFn: async (): Promise<ServiceIcon[]> => {
      const params = new URLSearchParams();
      if (category && category !== 'all' && category !== 'ALL') {
        params.set('category', category);
      }

      const response = await fetch(`/api/service-icons?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch icons');
      }
      const result = await response.json();
      
      // ✅ Fix: Access the icons array from result.data.icons
      return result.data?.icons || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Add icon to library
export function useAddServiceIcon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      imageUrl: string;
      category: string;
      tags?: string[];
    }) => {
      const response = await fetch('/api/service-icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add icon');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-icons'] });
      toast.success('Icon added to library');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete icon from library
export function useDeleteServiceIcon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/service-icons/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete icon');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-icons'] });
      toast.success('Icon removed from library');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}