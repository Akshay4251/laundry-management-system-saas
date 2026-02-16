// app/hooks/use-settings.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { UserPreferences } from '@/app/types/settings';

// Query Keys
export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  business: () => [...settingsKeys.all, 'business'] as const,
  preferences: () => [...settingsKeys.all, 'preferences'] as const,
};

// Types
export interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface BusinessData {
  id: string;
  businessName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  gstNumber?: string | null;
  planType: string;
  planStatus: string;
}

export interface BusinessSettingsData {
  id: string;
  businessId: string;
  gstEnabled: boolean;
  gstPercentage: number;
  currency: string;
  timezone: string;
}

export interface SettingsResponse {
  business: BusinessData | null;
  settings: BusinessSettingsData | null;
}

export interface BusinessSettingsUpdateData {
  businessName?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  logoUrl?: string | null;
  gstEnabled?: boolean;
  gstPercentage?: number;
}

// API Functions
async function fetchProfile(): Promise<ProfileData> {
  const response = await fetch('/api/settings/profile');
  if (!response.ok) throw new Error('Failed to fetch profile');
  const result = await response.json();
  return result.data;
}

async function updateProfile(data: { fullName?: string; email?: string }): Promise<ProfileData> {
  const response = await fetch('/api/settings/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }
  const result = await response.json();
  return result.data;
}

async function fetchBusinessSettings(): Promise<SettingsResponse> {
  const response = await fetch('/api/settings/business');
  if (!response.ok) throw new Error('Failed to fetch business settings');
  const result = await response.json();
  return result.data;
}

async function updateBusinessSettings(data: BusinessSettingsUpdateData): Promise<void> {
  const response = await fetch('/api/settings/business', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update settings');
  }
}

async function fetchPreferences(): Promise<UserPreferences> {
  const response = await fetch('/api/settings/preferences');
  if (!response.ok) throw new Error('Failed to fetch preferences');
  const result = await response.json();
  return result.data;
}

async function updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
  const response = await fetch('/api/settings/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update preferences');
  const result = await response.json();
  return result.data;
}

async function updatePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  const response = await fetch('/api/settings/password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update password');
  }
}

// Hooks
export function useProfile() {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update profile', { description: error.message });
    },
  });
}

export function useBusinessSettings() {
  return useQuery({
    queryKey: settingsKeys.business(),
    queryFn: fetchBusinessSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.business() });
      queryClient.invalidateQueries({ queryKey: ['businessFeatures'] });
      toast.success('Business settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update settings', { description: error.message });
    },
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: settingsKeys.preferences(),
    queryFn: fetchPreferences,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.preferences() });
      toast.success('Preferences updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update preferences', { description: error.message });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update password', { description: error.message });
    },
  });
}