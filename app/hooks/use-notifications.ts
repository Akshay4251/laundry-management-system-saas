// app/hooks/use-notifications.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useRef, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  data?: Record<string, unknown>;
  referenceId?: string | null;
  referenceType?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export type NotificationType = 
  | 'ORDER_CREATED'
  | 'ORDER_COMPLETED'
  | 'ORDER_READY'
  | 'ORDER_PICKED_UP'
  | 'ORDER_DELIVERED'
  | 'PAYMENT_RECEIVED'
  | 'LOW_STOCK'
  | 'NEW_CUSTOMER'
  | 'CUSTOMER_CREATED'
  | 'REWORK_REQUESTED'
  | 'WORKSHOP_RETURNED'
  | 'SYSTEM'
  | 'REMINDER';

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export interface NotificationsParams {
  limit?: number;
  unreadOnly?: boolean;
  page?: number;
  type?: NotificationType;
}

// ============================================================================
// Query Keys
// ============================================================================

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: NotificationsParams) => 
    [...notificationKeys.all, 'list', params] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};

// ============================================================================
// API Functions
// ============================================================================

async function fetchNotifications(params?: NotificationsParams): Promise<NotificationsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.unreadOnly) searchParams.set('unread', 'true');
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.type) searchParams.set('type', params.type);

  const response = await fetch(`/api/notifications?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  
  const result = await response.json();
  
  // Map the API response to the expected format
  return {
    notifications: result.data?.notifications ?? [],
    unreadCount: result.data?.stats?.unread ?? 0,
    total: result.data?.stats?.total ?? 0,
  };
}

async function markAsRead(notificationId: string): Promise<void> {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isRead: true }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
}

async function markAllAsRead(): Promise<void> {
  const response = await fetch('/api/notifications/mark-all-read', {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
}

async function deleteNotification(notificationId: string): Promise<void> {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
}

// ============================================================================
// Hooks
// ============================================================================

export function useNotifications(params?: NotificationsParams) {
  const queryClient = useQueryClient();
  const previousUnreadCount = useRef<number>(0);
  const isInitialLoad = useRef(true);

  const query = useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => fetchNotifications(params),
    staleTime: 10 * 1000, // 10 seconds - consider data stale quickly
    refetchInterval: 15 * 1000, // Poll every 15 seconds for real-time updates
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: false, // Don't poll when tab is not visible
  });

  // Detect new notifications and show toast
  useEffect(() => {
    if (query.data) {
      const currentUnreadCount = query.data.unreadCount;
      
      // Skip the initial load
      if (isInitialLoad.current) {
        previousUnreadCount.current = currentUnreadCount;
        isInitialLoad.current = false;
        return;
      }

      // Check if there are new unread notifications
      if (currentUnreadCount > previousUnreadCount.current) {
        const newCount = currentUnreadCount - previousUnreadCount.current;
        const latestNotification = query.data.notifications.find(n => !n.isRead);
        
        // Show toast for new notification
        if (latestNotification) {
          toast(latestNotification.title, {
            description: latestNotification.message || undefined,
            icon: getNotificationEmoji(latestNotification.type),
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => {
                // Navigate to notification or mark as read
                queryClient.invalidateQueries({ queryKey: notificationKeys.all });
              },
            },
          });
        } else if (newCount > 0) {
          toast.info(`You have ${newCount} new notification${newCount > 1 ? 's' : ''}`);
        }

        // Play notification sound (optional)
        playNotificationSound();
      }

      previousUnreadCount.current = currentUnreadCount;
    }
  }, [query.data, queryClient]);

  return query;
}

export function useNotificationsPaginated(params?: NotificationsParams) {
  return useQuery({
    queryKey: notificationKeys.list({ ...params, page: params?.page ?? 1 }),
    queryFn: () => fetchNotifications(params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onMutate: async (notificationId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      
      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all });
      
      queryClient.setQueriesData(
        { queryKey: notificationKeys.all },
        (old: NotificationsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map(n =>
              n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ),
            unreadCount: Math.max(0, old.unreadCount - 1),
          };
        }
      );
      
      return { previousData };
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to mark notification as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      
      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all });
      
      queryClient.setQueriesData(
        { queryKey: notificationKeys.all },
        (old: NotificationsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map(n => ({
              ...n,
              isRead: true,
              readAt: new Date().toISOString(),
            })),
            unreadCount: 0,
          };
        }
      );
      
      return { previousData };
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to mark all as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      
      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all });
      
      queryClient.setQueriesData(
        { queryKey: notificationKeys.all },
        (old: NotificationsResponse | undefined) => {
          if (!old) return old;
          const deletedNotification = old.notifications.find(n => n.id === notificationId);
          return {
            ...old,
            notifications: old.notifications.filter(n => n.id !== notificationId),
            total: old.total - 1,
            unreadCount: deletedNotification && !deletedNotification.isRead 
              ? old.unreadCount - 1 
              : old.unreadCount,
          };
        }
      );
      
      return { previousData };
    },
    onSuccess: () => {
      toast.success('Notification deleted');
    },
    onError: (err, notificationId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to delete notification');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// Force refetch hook for manual refresh
export function useRefreshNotifications() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  }, [queryClient]);
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getNotificationEmoji(type: NotificationType): string {
  const emojis: Record<NotificationType, string> = {
    ORDER_CREATED: '📦',
    ORDER_COMPLETED: '✅',
    ORDER_READY: '🔔',
    ORDER_PICKED_UP: '🚚',
    ORDER_DELIVERED: '📍',
    PAYMENT_RECEIVED: '💰',
    LOW_STOCK: '⚠️',
    NEW_CUSTOMER: '👤',
    CUSTOMER_CREATED: '👤',
    REWORK_REQUESTED: '🔄',
    WORKSHOP_RETURNED: '↩️',
    SYSTEM: '⚙️',
    REMINDER: '⏰',
  };
  return emojis[type] || '📌';
}

export function getNotificationIcon(type: NotificationType): string {
  return getNotificationEmoji(type);
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    ORDER_CREATED: 'bg-blue-100 text-blue-600',
    ORDER_COMPLETED: 'bg-green-100 text-green-600',
    ORDER_READY: 'bg-amber-100 text-amber-600',
    ORDER_PICKED_UP: 'bg-purple-100 text-purple-600',
    ORDER_DELIVERED: 'bg-teal-100 text-teal-600',
    PAYMENT_RECEIVED: 'bg-emerald-100 text-emerald-600',
    LOW_STOCK: 'bg-red-100 text-red-600',
    NEW_CUSTOMER: 'bg-indigo-100 text-indigo-600',
    CUSTOMER_CREATED: 'bg-purple-100 text-purple-600',
    REWORK_REQUESTED: 'bg-orange-100 text-orange-600',
    WORKSHOP_RETURNED: 'bg-violet-100 text-violet-600',
    SYSTEM: 'bg-slate-100 text-slate-600',
    REMINDER: 'bg-orange-100 text-orange-600',
  };
  return colors[type] || 'bg-slate-100 text-slate-600';
}

export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    ORDER_CREATED: 'New Order',
    ORDER_COMPLETED: 'Order Completed',
    ORDER_READY: 'Order Ready',
    ORDER_PICKED_UP: 'Order Picked Up',
    ORDER_DELIVERED: 'Order Delivered',
    PAYMENT_RECEIVED: 'Payment',
    LOW_STOCK: 'Low Stock',
    NEW_CUSTOMER: 'New Customer',
    CUSTOMER_CREATED: 'New Customer',
    REWORK_REQUESTED: 'Rework Request',
    WORKSHOP_RETURNED: 'Workshop Return',
    SYSTEM: 'System',
    REMINDER: 'Reminder',
  };
  return labels[type] || 'Notification';
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Play notification sound
function playNotificationSound() {
  try {
    // Check if user has interacted with the page (browser requirement)
    if (typeof window !== 'undefined' && document.hasFocus()) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors - user may not have interacted yet
      });
    }
  } catch {
    // Ignore audio errors
  }
}