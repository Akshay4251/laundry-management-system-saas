//app/hooks/use-user.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// ============= Types =============
export interface BusinessInfo {
  id: string;
  businessName: string;
  planType?: string;
  planStatus?: string;
  logoUrl?: string | null;
}

export interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  businessId: string | null;
  isSuperAdmin: boolean;
}

export interface UseUserReturn {
  user: UserData | null;
  business: BusinessInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshBusiness: () => Promise<void>;
}

// ============= Main Hook =============
export function useUser(): UseUserReturn {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [isBusinessLoading, setIsBusinessLoading] = useState(false);

  // Fetch business info
  const fetchBusiness = useCallback(async () => {
    if (!session?.user?.id) {
      setBusiness(null);
      return;
    }

    try {
      setIsBusinessLoading(true);
      const response = await fetch('/api/business');
      
      if (!response.ok) {
        throw new Error('Failed to fetch business');
      }

      const result = await response.json();
      setBusiness(result.data);
    } catch (error) {
      console.error('Failed to fetch business:', error);
      setBusiness(null);
    } finally {
      setIsBusinessLoading(false);
    }
  }, [session?.user?.id]);

  // Update user when session changes
  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || '',
        role: session.user.role,
        businessId: session.user.businessId,
        isSuperAdmin: session.user.isSuperAdmin || false,
      });
    } else {
      setUser(null);
      setBusiness(null);
    }
  }, [session]);

  // Fetch business when user is available
  useEffect(() => {
    if (session?.user?.id && status === 'authenticated') {
      fetchBusiness();
    }
  }, [session?.user?.id, status, fetchBusiness]);

  return {
    user,
    business,
    isLoading: status === 'loading' || isBusinessLoading,
    isAuthenticated: status === 'authenticated',
    refreshBusiness: fetchBusiness,
  };
}

// ============= Helper Functions =============
export function getUserInitials(name: string | null): string {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function getBusinessInitials(name: string | null): string {
  if (!name) return 'B';
  
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}