// app/hooks/use-customers.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { 
  Customer, 
  CustomerWithStats, 
  CustomerFilters, 
  CreateCustomerInput, 
  UpdateCustomerInput,
  PaginatedCustomers,
} from '@/app/types/customer';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

async function fetchCustomers(filters: CustomerFilters): Promise<PaginatedCustomers> {
  const params = new URLSearchParams();
  
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.tags) params.set('tags', filters.tags);
  if (filters.includeDeleted) params.set('includeDeleted', 'true');

  const response = await fetch(`/api/customers?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch customers');
  }
  
  const result = await response.json();
  return result.data;
}

async function fetchCustomerById(id: string) {
  const response = await fetch(`/api/customers/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch customer');
  }
  
  const result = await response.json();
  return result.data.customer;
}

async function createCustomer(data: CreateCustomerInput): Promise<Customer> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create customer');
  }
  
  const result = await response.json();
  return result.data.customer;
}

async function updateCustomer(id: string, data: UpdateCustomerInput): Promise<Customer> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update customer');
  }
  
  const result = await response.json();
  return result.data.customer;
}

async function deleteCustomer(id: string): Promise<void> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete customer');
  }
}

async function checkDuplicatePhone(phone: string, excludeId?: string): Promise<{ isDuplicate: boolean; customer: Customer | null }> {
  const params = new URLSearchParams({ phone });
  if (excludeId) params.set('excludeId', excludeId);
  
  const response = await fetch(`/api/customers/check-duplicate?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to check duplicate');
  }
  
  const result = await response.json();
  return result.data;
}

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => fetchCustomers(filters),
    staleTime: 30000,
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: customerKeys.detail(id || ''),
    queryFn: () => fetchCustomerById(id!),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success('Customer created successfully', {
        description: `${data.fullName} has been added.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create customer', {
        description: error.message,
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerInput }) => 
      updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success('Customer updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update customer', {
        description: error.message,
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success('Customer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete customer', {
        description: error.message,
      });
    },
  });
}

export function useCheckDuplicatePhone() {
  return useMutation({
    mutationFn: ({ phone, excludeId }: { phone: string; excludeId?: string }) => 
      checkDuplicatePhone(phone, excludeId),
  });
}

export type { Customer, CustomerWithStats, CustomerFilters, CreateCustomerInput, UpdateCustomerInput };