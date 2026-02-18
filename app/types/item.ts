// app/types/item.ts

export type ItemCategory = 'GARMENT' | 'HOUSEHOLD' | 'SPECIALTY';

export interface ServicePrice {
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  price: number | null;
  expressPrice: number | null;
  isAvailable: boolean;
}

export interface Item {
  id: string;
  name: string;
  description?: string | null;
  category: ItemCategory;
  iconUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  prices?: ServicePrice[];
  pricesCount?: number;
  availablePricesCount?: number;
  usageCount?: number;
}

export interface ItemWithPricing extends Item {
  prices: ServicePrice[];
}

export interface ItemStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
  totalPricesSet: number;
}

export interface ItemFilters {
  search?: string;
  category?: ItemCategory | 'all';
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateItemInput {
  name: string;
  description?: string | null;
  category: ItemCategory;
  iconUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  prices?: {
    serviceId: string;
    price: number;
    expressPrice?: number | null;
    isAvailable?: boolean;
  }[];
}

export interface UpdateItemInput {
  name?: string;
  description?: string | null;
  category?: ItemCategory;
  iconUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  prices?: {
    serviceId: string;
    price: number;
    expressPrice?: number | null;
    isAvailable?: boolean;
  }[];
}