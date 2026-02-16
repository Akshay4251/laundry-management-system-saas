// app/contexts/app-context.tsx
// ✅ NEW: Single source of truth for all app-wide data
// Replaces: store-context + multiple duplicate fetches

'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { BusinessFeatures } from '@/app/hooks/use-business-features';
import type { SubscriptionStatus } from '@/app/hooks/use-subscription-status';

// ============================================================================
// TYPES
// ============================================================================

export interface Store {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface BusinessInfo {
  id: string;
  businessName: string;
  planType?: string;
  planStatus?: string;
  logoUrl?: string | null;
  gstNumber?: string | null;
}

interface AppContextData {
  // Stores
  stores: Store[];
  selectedStore: Store | null;
  selectedStoreId: string;
  setSelectedStoreId: (id: string) => void;
  
  // Business
  business: BusinessInfo | null;
  
  // Features
  features: BusinessFeatures | null;
  
  // Subscription
  subscription: SubscriptionStatus | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refetch: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AppContext = createContext<AppContextData | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { data: session, status: sessionStatus } = useSession();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [features, setFeatures] = useState<BusinessFeatures | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [selectedStoreId, setSelectedStoreIdState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⚡ OPTIMIZED: Single function to fetch ALL data in parallel
  const fetchAppData = async () => {
    if (sessionStatus !== 'authenticated' || !session?.user) {
      setIsLoading(false);
      return;
    }

    // Skip for super admin
    if (session.user.isSuperAdmin) {
      setIsLoading(false);
      return;
    }

    if (!session.user.businessId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // ⚡ CRITICAL: Fetch ALL in PARALLEL (not sequential!)
      const [storesRes, businessRes, featuresRes, subscriptionRes] = await Promise.allSettled([
        fetch('/api/stores'),
        fetch('/api/business'),
        fetch('/api/business/features'),
        fetch('/api/subscription/status'),
      ]);

      // Process stores
      if (storesRes.status === 'fulfilled' && storesRes.value.ok) {
        const storesData = await storesRes.value.json();
        const storesList = storesData.data || [];
        setStores(storesList);

        // Auto-select store
        if (storesList.length > 0 && !selectedStoreId) {
          const storedId = typeof window !== 'undefined' 
            ? localStorage.getItem('selectedStoreId') 
            : null;
          const validStore = storesList.find((s: Store) => s.id === storedId);
          setSelectedStoreId(validStore ? storedId! : storesList[0].id);
        }
      }

      // Process business
      if (businessRes.status === 'fulfilled' && businessRes.value.ok) {
        const businessData = await businessRes.value.json();
        setBusiness(businessData.data);
      }

      // Process features
      if (featuresRes.status === 'fulfilled' && featuresRes.value.ok) {
        const featuresData = await featuresRes.value.json();
        setFeatures(featuresData.data);
      }

      // Process subscription
      if (subscriptionRes.status === 'fulfilled' && subscriptionRes.value.ok) {
        const subscriptionData = await subscriptionRes.value.json();
        setSubscription(subscriptionData.data);
      }

    } catch (err) {
      console.error('Failed to fetch app data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    fetchAppData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session?.user?.id]);

  // Persist selected store
  const setSelectedStoreId = (id: string) => {
    setSelectedStoreIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedStoreId', id);
    }
  };

  const selectedStore = stores.find(s => s.id === selectedStoreId) || null;

  const value: AppContextData = {
    stores,
    selectedStore,
    selectedStoreId,
    setSelectedStoreId,
    business,
    features,
    subscription,
    isLoading,
    error,
    refetch: fetchAppData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================================
// HOOKS
// ============================================================================

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// Convenience hooks for specific data
export function useStores() {
  const { stores, selectedStore, selectedStoreId, setSelectedStoreId, isLoading } = useAppContext();
  return { stores, selectedStore, selectedStoreId, setSelectedStoreId, loading: isLoading };
}

export function useBusiness() {
  const { business, isLoading } = useAppContext();
  return { business, loading: isLoading };
}

export function useFeatures() {
  const { features, isLoading } = useAppContext();
  return { features, loading: isLoading };
}

export function useSubscription() {
  const { subscription, isLoading } = useAppContext();
  return { subscription, loading: isLoading };
}