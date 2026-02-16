// app/hooks/use-business-features.ts

import { useAppContext } from '@/app/contexts/app-context';

export interface BusinessFeatures {
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  workshopEnabled: boolean;
  multiStoreEnabled: boolean;
  gstEnabled: boolean;
  gstPercentage: number;
  gstNumber: string | null;
  maxStores: number;
  maxStaff: number;
  maxMonthlyOrders: number;
  smsNotifications: boolean;
  emailNotifications: boolean;
  whatsappIntegration: boolean;
  advancedReports: boolean;
  expressMultiplier: number;
  planType: string;
  planStatus: string;
}

const DEFAULT_FEATURES: BusinessFeatures = {
  pickupEnabled: true,
  deliveryEnabled: true,
  workshopEnabled: false,
  multiStoreEnabled: false,
  gstEnabled: false,
  gstPercentage: 18,
  gstNumber: null,
  maxStores: 1,
  maxStaff: 5,
  maxMonthlyOrders: 100,
  smsNotifications: false,
  emailNotifications: true,
  whatsappIntegration: false,
  advancedReports: false,
  expressMultiplier: 1.5,
  planType: 'TRIAL',
  planStatus: 'TRIAL',
};

export function useBusinessFeatures() {
  const { features, isLoading } = useAppContext();

  const activeFeatures = features ?? DEFAULT_FEATURES;

  return {
    features: activeFeatures,
    pickupEnabled: activeFeatures.pickupEnabled,
    deliveryEnabled: activeFeatures.deliveryEnabled,
    workshopEnabled: activeFeatures.workshopEnabled,
    multiStoreEnabled: activeFeatures.multiStoreEnabled,
    gstEnabled: activeFeatures.gstEnabled,
    gstPercentage: activeFeatures.gstPercentage,
    gstNumber: activeFeatures.gstNumber,
    planType: activeFeatures.planType,
    planStatus: activeFeatures.planStatus,
    isPremium: ['PROFESSIONAL', 'ENTERPRISE'].includes(activeFeatures.planType),
    isEnterprise: activeFeatures.planType === 'ENTERPRISE',
    isTrial: activeFeatures.planType === 'TRIAL' || activeFeatures.planStatus === 'TRIAL',
    limits: {
      maxStores: activeFeatures.maxStores,
      maxStaff: activeFeatures.maxStaff,
      maxMonthlyOrders: activeFeatures.maxMonthlyOrders,
    },
    expressMultiplier: activeFeatures.expressMultiplier,
    isLoading,
    isError: false,
    error: null,
    refetch: async () => {},
  };
}

export function calculateGST(subtotal: number, gstPercentage: number): number {
  return (subtotal * gstPercentage) / 100;
}

export function calculateTotalWithGST(
  subtotal: number, 
  gstEnabled: boolean, 
  gstPercentage: number
): { gstAmount: number; total: number } {
  if (!gstEnabled) {
    return { gstAmount: 0, total: subtotal };
  }
  
  const gstAmount = calculateGST(subtotal, gstPercentage);
  return { gstAmount, total: subtotal + gstAmount };
}