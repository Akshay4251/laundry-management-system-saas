// app/types/treatment.ts

export interface Treatment {
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

export interface TreatmentStats {
  total: number;
  active: number;
  inactive: number;
  combo: number;
}

export interface TreatmentFilters {
  search?: string;
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateTreatmentInput {
  name: string;
  code?: string;
  description?: string | null;
  iconUrl?: string | null;
  isCombo?: boolean;
  turnaroundHours?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateTreatmentInput {
  name?: string;
  code?: string;
  description?: string | null;
  iconUrl?: string | null;
  isCombo?: boolean;
  turnaroundHours?: number;
  isActive?: boolean;
  sortOrder?: number;
}