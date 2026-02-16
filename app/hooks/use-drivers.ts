// app/hooks/use-drivers.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface DriverListItem {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  completedOrders?: number;
}

type DriversResponse = {
  success: boolean;
  data: DriverListItem[];
  message?: string;
};

async function fetchDrivers(): Promise<DriversResponse> {
  const res = await fetch('/api/drivers');
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Failed to fetch drivers');
  }
  return json;
}

type CreateDriverInput = {
  fullName: string;
  phone: string;
  email?: string | null;
  password: string;
};

async function createDriver(input: CreateDriverInput) {
  const res = await fetch('/api/drivers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Failed to create driver');
  }

  return json as {
    success: boolean;
    data: DriverListItem;
    message?: string;
  };
}

export function useDrivers() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: fetchDrivers,
    staleTime: 30_000,
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createDriver,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['drivers'] });
      toast.success(data.message || 'Driver created');
    },
    onError: (err: Error) => {
      toast.error('Failed to create driver', { description: err.message });
    },
  });
}