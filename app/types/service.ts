// app/types/service.ts

export interface Service {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  iconUrl?: string | null;
  isCombo: boolean;
  turnaroundHours: number;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  itemsCount?: number;
  pricesCount?: number;
  usageCount?: number;
}

export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  combo: number;
}

export interface ServiceFilters {
  search?: string;
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateServiceInput {
  name: string;
  code?: string;
  description?: string | null;
  iconUrl?: string | null;
  isCombo?: boolean;
  turnaroundHours?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateServiceInput {
  name?: string;
  code?: string;
  description?: string | null;
  iconUrl?: string | null;
  isCombo?: boolean;
  turnaroundHours?: number;
  isActive?: boolean;
  sortOrder?: number;
}