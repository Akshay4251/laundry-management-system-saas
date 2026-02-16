// app/(dashboard)/notifications/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Package,
  CreditCard,
  AlertTriangle,
  UserPlus,
  Clock,
  Cog,
  ChevronRight,
  Inbox,
  RefreshCw,
  Check,
  Truck,
  MapPin,
  RotateCcw,
  ArrowLeftRight,
  Search,
  X,
  FilterX,
  ChevronDown,
  Eye,
  EyeOff,
  MoreVertical,
  Loader2,
  Sparkles,
  BellRing,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead,
  useDeleteNotification,
  useRefreshNotifications,
  formatTimeAgo,
  getNotificationTypeLabel,
  type NotificationType,
  type Notification,
} from '@/app/hooks/use-notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ============================================================================
// CONSTANTS
// ============================================================================

const notificationIcons: Record<NotificationType, React.ElementType> = {
  ORDER_CREATED: Package,
  ORDER_COMPLETED: CheckCheck,
  ORDER_READY: BellRing,
  ORDER_PICKED_UP: Truck,
  ORDER_DELIVERED: MapPin,
  PAYMENT_RECEIVED: CreditCard,
  LOW_STOCK: AlertTriangle,
  NEW_CUSTOMER: UserPlus,
  CUSTOMER_CREATED: UserPlus,
  REWORK_REQUESTED: RotateCcw,
  WORKSHOP_RETURNED: ArrowLeftRight,
  SYSTEM: Cog,
  REMINDER: Clock,
};

const notificationColors: Record<NotificationType, { 
  bg: string; 
  text: string; 
  border: string;
  gradient: string;
  lightBg: string;
}> = {
  ORDER_CREATED: { 
    bg: 'bg-blue-100', 
    text: 'text-blue-600', 
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50',
  },
  ORDER_COMPLETED: { 
    bg: 'bg-green-100', 
    text: 'text-green-600', 
    border: 'border-green-200',
    gradient: 'from-green-500 to-green-600',
    lightBg: 'bg-green-50',
  },
  ORDER_READY: { 
    bg: 'bg-amber-100', 
    text: 'text-amber-600', 
    border: 'border-amber-200',
    gradient: 'from-amber-500 to-amber-600',
    lightBg: 'bg-amber-50',
  },
  ORDER_PICKED_UP: { 
    bg: 'bg-purple-100', 
    text: 'text-purple-600', 
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50',
  },
  ORDER_DELIVERED: { 
    bg: 'bg-teal-100', 
    text: 'text-teal-600', 
    border: 'border-teal-200',
    gradient: 'from-teal-500 to-teal-600',
    lightBg: 'bg-teal-50',
  },
  PAYMENT_RECEIVED: { 
    bg: 'bg-emerald-100', 
    text: 'text-emerald-600', 
    border: 'border-emerald-200',
    gradient: 'from-emerald-500 to-emerald-600',
    lightBg: 'bg-emerald-50',
  },
  LOW_STOCK: { 
    bg: 'bg-red-100', 
    text: 'text-red-600', 
    border: 'border-red-200',
    gradient: 'from-red-500 to-red-600',
    lightBg: 'bg-red-50',
  },
  NEW_CUSTOMER: { 
    bg: 'bg-indigo-100', 
    text: 'text-indigo-600', 
    border: 'border-indigo-200',
    gradient: 'from-indigo-500 to-indigo-600',
    lightBg: 'bg-indigo-50',
  },
  CUSTOMER_CREATED: { 
    bg: 'bg-purple-100', 
    text: 'text-purple-600', 
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50',
  },
  REWORK_REQUESTED: { 
    bg: 'bg-orange-100', 
    text: 'text-orange-600', 
    border: 'border-orange-200',
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50',
  },
  WORKSHOP_RETURNED: { 
    bg: 'bg-violet-100', 
    text: 'text-violet-600', 
    border: 'border-violet-200',
    gradient: 'from-violet-500 to-violet-600',
    lightBg: 'bg-violet-50',
  },
  SYSTEM: { 
    bg: 'bg-slate-100', 
    text: 'text-slate-600', 
    border: 'border-slate-200',
    gradient: 'from-slate-500 to-slate-600',
    lightBg: 'bg-slate-50',
  },
  REMINDER: { 
    bg: 'bg-orange-100', 
    text: 'text-orange-600', 
    border: 'border-orange-200',
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50',
  },
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Notifications', icon: Bell },
  { value: 'unread', label: 'Unread Only', icon: EyeOff },
  { value: 'ORDER_CREATED', label: 'New Orders', icon: Package },
  { value: 'ORDER_COMPLETED', label: 'Completed', icon: CheckCheck },
  { value: 'PAYMENT_RECEIVED', label: 'Payments', icon: CreditCard },
  { value: 'LOW_STOCK', label: 'Low Stock', icon: AlertTriangle },
  { value: 'NEW_CUSTOMER', label: 'New Customers', icon: UserPlus },
] as const;

type FilterType = 'all' | 'unread' | NotificationType;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getNotificationLink(notification: Notification): string | null {
  if (notification.referenceId && notification.referenceType) {
    switch (notification.referenceType) {
      case 'ORDER':
        return `/orders/${notification.referenceId}`;
      case 'CUSTOMER':
        return `/customers?id=${notification.referenceId}`;
      case 'INVENTORY':
        return `/inventory`;
      default:
        return null;
    }
  }
  return null;
}

function getNotificationColors(type: NotificationType) {
  return notificationColors[type] || notificationColors.SYSTEM;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NotificationsPage() {
  const router = useRouter();
  
  // ============= State =============
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  // ============= Debounce Search =============
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ============= React Query Hooks =============
  const { 
    data, 
    isLoading, 
    isFetching,
    isError,
    error,
    refetch,
  } = useNotifications({ 
    limit: 100,
    unreadOnly: filter === 'unread',
    type: filter !== 'all' && filter !== 'unread' ? filter as NotificationType : undefined,
  });
  
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const refreshNotifications = useRefreshNotifications();

  // ============= Computed Values =============
  const allNotifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const total = data?.total ?? 0;

  // Filter notifications by search query
  const notifications = allNotifications.filter((n) => {
    if (!debouncedSearch) return true;
    const query = debouncedSearch.toLowerCase();
    return (
      n.title.toLowerCase().includes(query) ||
      (n.message?.toLowerCase().includes(query) ?? false)
    );
  });

  const hasActiveFilters = searchQuery !== '' || filter !== 'all';
  const currentFilter = FILTER_OPTIONS.find((opt) => opt.value === filter);

  // ============= Handlers =============
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setFilter('all');
  }, []);

  const handleMarkAsRead = useCallback((id: string) => {
    markAsRead.mutate(id);
  }, [markAsRead]);

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteNotification.mutate(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteNotification]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    const link = getNotificationLink(notification);
    if (link) {
      router.push(link);
    }
  }, [handleMarkAsRead, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsFilterOpen(false);
    if (isFilterOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isFilterOpen]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="border-b border-slate-200">
        <div className="px-4 lg:px-6 py-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2.5 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-500">
                Stay updated with your business activity
                {total > 0 && (
                  <span className="ml-2 text-slate-400">
                    • {total} total notifications
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <button
                onClick={refreshNotifications}
                disabled={isFetching}
                className={cn(
                  'h-11 flex items-center justify-center px-4 gap-2 rounded-full transition-all duration-200',
                  'bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                  'text-slate-600 font-medium text-sm',
                  isFetching && 'opacity-70'
                )}
              >
                <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Mark All Read Button */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markAllAsRead.isPending}
                  className={cn(
                    'h-11 flex items-center justify-center px-5 gap-2 rounded-full transition-all duration-200',
                    'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm',
                    markAllAsRead.isPending && 'opacity-70'
                  )}
                >
                  {markAllAsRead.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  <span>Mark All Read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  'flex items-center h-11 rounded-full border bg-white transition-all duration-200',
                  isSearchFocused
                    ? 'border-blue-500 ring-4 ring-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Search
                  className={cn(
                    'w-4 h-4 ml-4 shrink-0 transition-colors',
                    isSearchFocused ? 'text-blue-500' : 'text-slate-400'
                  )}
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="flex-1 h-full bg-transparent border-0 outline-none text-sm placeholder:text-slate-400 px-3 min-w-0"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery('')}
                      className="mr-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-52">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilterOpen(!isFilterOpen);
                }}
                className={cn(
                  'w-full h-11 flex items-center justify-between gap-2 px-4 rounded-full border bg-white transition-all duration-200',
                  isFilterOpen
                    ? 'border-blue-500 ring-4 ring-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2">
                  {currentFilter?.icon && (
                    <currentFilter.icon className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="truncate text-sm font-medium text-slate-700">
                    {currentFilter?.label}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
                    isFilterOpen && 'rotate-180'
                  )}
                />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-1.5 max-h-64 overflow-y-auto">
                      {FILTER_OPTIONS.map((option, index) => {
                        const Icon = option.icon;
                        return (
                          <div key={option.value}>
                            {index === 2 && (
                              <div className="my-1 border-t border-slate-100" />
                            )}
                            <button
                              onClick={() => {
                                setFilter(option.value as FilterType);
                                setIsFilterOpen(false);
                              }}
                              className={cn(
                                'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-150',
                                filter === option.value
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'hover:bg-slate-50 text-slate-700'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{option.label}</span>
                              </div>
                              {filter === option.value && (
                                <Check className="w-4 h-4 text-blue-600" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Unread Only Toggle */}
            <button
              onClick={() => setFilter(filter === 'unread' ? 'all' : 'unread')}
              className={cn(
                'h-11 flex items-center justify-center px-5 gap-2 rounded-full border transition-all duration-200 font-medium text-sm',
                filter === 'unread'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600'
              )}
            >
              {filter === 'unread' ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Unread</span>
              {unreadCount > 0 && filter !== 'unread' && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Clear Filters */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: 'auto' }}
                  exit={{ opacity: 0, scale: 0.9, width: 0 }}
                  onClick={handleClearFilters}
                  className={cn(
                    'h-11 flex items-center justify-center px-5 gap-2 rounded-full border transition-all duration-200',
                    'bg-white border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600',
                    'text-slate-600 font-medium text-sm overflow-hidden'
                  )}
                >
                  <FilterX className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Clear</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count */}
          <AnimatePresence>
            {hasActiveFilters && notifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-full border border-blue-100 w-fit">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Showing <span className="font-semibold">{notifications.length}</span> of{' '}
                    <span className="font-semibold">{total}</span> notifications
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        {isLoading ? (
          // Loading State
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ) : isError ? (
          // Error State
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load notifications</h3>
            <p className="text-sm text-slate-500 mb-4">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="rounded-full">
              Try Again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200">
                {filter === 'unread' ? (
                  <Sparkles className="w-9 h-9 text-slate-400" />
                ) : (
                  <Inbox className="w-9 h-9 text-slate-400" />
                )}
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                <Bell className="w-3 h-3 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {filter === 'unread' ? 'All caught up!' : hasActiveFilters ? 'No notifications found' : 'No notifications yet'}
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
              {filter === 'unread'
                ? "You've read all your notifications. Great job staying on top of things!"
                : hasActiveFilters
                ? "We couldn't find any notifications matching your filters. Try adjusting your search."
                : "When you receive notifications about orders, payments, or customers, they'll appear here."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="h-10 px-5 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2"
              >
                <FilterX className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                      <th className="text-left py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider w-12">
                        Status
                      </th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                        Notification
                      </th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider w-32">
                        Type
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider w-32">
                        Time
                      </th>
                      <th className="text-center py-4 px-5 text-xs font-semibold text-blue-900 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                      {notifications.map((notification) => {
                        const IconComponent = notificationIcons[notification.type] || Bell;
                        const colors = getNotificationColors(notification.type);
                        const link = getNotificationLink(notification);

                        return (
                          <motion.tr
                            key={notification.id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className={cn(
                              "group transition-colors cursor-pointer",
                              !notification.isRead
                                ? "bg-gradient-to-r from-blue-50/50 to-white hover:from-blue-100/50"
                                : "hover:bg-slate-50/70"
                            )}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {/* Status Indicator */}
                            <td className="py-4 px-5">
                              <div className="flex justify-center">
                                {!notification.isRead ? (
                                  <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                                ) : (
                                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                                )}
                              </div>
                            </td>

                            {/* Notification Content */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105',
                                    !notification.isRead
                                      ? `bg-gradient-to-br ${colors.gradient} shadow-md`
                                      : `${colors.bg} ${colors.border}`
                                  )}
                                >
                                  <IconComponent 
                                    className={cn(
                                      "w-6 h-6",
                                      !notification.isRead ? "text-white" : colors.text
                                    )} 
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={cn(
                                    "text-slate-900 truncate",
                                    !notification.isRead ? "font-semibold" : "font-medium"
                                  )}>
                                    {notification.title}
                                  </p>
                                  {notification.message && (
                                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                                      {notification.message}
                                    </p>
                                  )}
                                </div>
                                {link && (
                                  <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                )}
                              </div>
                            </td>

                            {/* Type Badge */}
                            <td className="py-4 px-5">
                              <span
                                className={cn(
                                  'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border',
                                  colors.bg,
                                  colors.text,
                                  colors.border
                                )}
                              >
                                {getNotificationTypeLabel(notification.type)}
                              </span>
                            </td>

                            {/* Time */}
                            <td className="py-4 px-5">
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-slate-700">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5">
                              <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-slate-100"
                                    >
                                      <MoreVertical className="w-4 h-4 text-slate-600" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48 bg-white border border-slate-200 shadow-lg"
                                  >
                                    {!notification.isRead && (
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                      >
                                        <Check className="w-4 h-4 mr-2" />
                                        Mark as Read
                                      </DropdownMenuItem>
                                    )}
                                    {link && (
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => router.push(link)}
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                      onClick={() => handleDelete(notification.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => {
                  const IconComponent = notificationIcons[notification.type] || Bell;
                  const colors = getNotificationColors(notification.type);
                  const link = getNotificationLink(notification);

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={cn(
                        "bg-white border rounded-2xl overflow-hidden shadow-sm",
                        !notification.isRead
                          ? "border-blue-200"
                          : "border-slate-200"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Card Header */}
                      <div
                        className={cn(
                          'px-4 py-3 border-b',
                          !notification.isRead
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100/30 border-blue-100'
                            : 'bg-gradient-to-r from-slate-50 to-slate-100/30 border-slate-100'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center border',
                                !notification.isRead
                                  ? `bg-gradient-to-br ${colors.gradient} border-transparent shadow-md`
                                  : `${colors.bg} ${colors.border}`
                              )}
                            >
                              <IconComponent 
                                className={cn(
                                  "w-5 h-5",
                                  !notification.isRead ? "text-white" : colors.text
                                )} 
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                                    colors.bg,
                                    colors.text,
                                    colors.border
                                  )}
                                >
                                  {getNotificationTypeLabel(notification.type)}
                                </span>
                                {!notification.isRead && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 bg-white border border-slate-200 shadow-lg"
                              >
                                {!notification.isRead && (
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                )}
                                {link && (
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => router.push(link)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                  onClick={() => handleDelete(notification.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <h3 className={cn(
                          "text-slate-900 mb-1",
                          !notification.isRead ? "font-semibold" : "font-medium"
                        )}>
                          {notification.title}
                        </h3>
                        {notification.message && (
                          <p className="text-sm text-slate-500 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        {link && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium">
                              View details
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Footer Stats */}
        {!isLoading && notifications.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Showing {notifications.length} of {total} notifications
              {filter !== 'all' && ` • Filtered by: ${currentFilter?.label}`}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This notification will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteNotification.isPending} className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteNotification.isPending}
              className="rounded-full bg-red-600 hover:bg-red-700"
            >
              {deleteNotification.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}