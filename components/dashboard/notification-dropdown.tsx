// components/dashboard/notification-dropdown.tsx

'use client';

import { memo } from 'react';
import { Bell, CheckCheck, Loader2, ExternalLink, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getNotificationTypeLabel,
  formatTimeAgo,
  type Notification,
} from '@/app/hooks/use-notifications';

// Notification icon/color mapping (moved from header)
const NOTIFICATION_ICONS: Record<string, any> = {
  ORDER_CREATED: '📦',
  ORDER_COMPLETED: '✅',
  ORDER_READY: '🔔',
  PAYMENT_RECEIVED: '💰',
  LOW_STOCK: '⚠️',
  CUSTOMER_CREATED: '👤',
  WORKSHOP_RETURNED: '↩️',
  SYSTEM: '⚙️',
  REMINDER: '⏰',
};

const NOTIFICATION_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  ORDER_CREATED: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
  ORDER_COMPLETED: { bg: 'bg-green-100', text: 'text-green-600', gradient: 'from-green-500 to-green-600' },
  ORDER_READY: { bg: 'bg-amber-100', text: 'text-amber-600', gradient: 'from-amber-500 to-amber-600' },
  PAYMENT_RECEIVED: { bg: 'bg-emerald-100', text: 'text-emerald-600', gradient: 'from-emerald-500 to-emerald-600' },
  LOW_STOCK: { bg: 'bg-red-100', text: 'text-red-600', gradient: 'from-red-500 to-red-600' },
  CUSTOMER_CREATED: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
  WORKSHOP_RETURNED: { bg: 'bg-violet-100', text: 'text-violet-600', gradient: 'from-violet-500 to-violet-600' },
  SYSTEM: { bg: 'bg-slate-100', text: 'text-slate-600', gradient: 'from-slate-500 to-slate-600' },
  REMINDER: { bg: 'bg-orange-100', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
};

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationClick: (id: string, isRead: boolean) => void;
  onMarkAllRead: () => void;
  isMarkingAllRead?: boolean;
}

export const NotificationDropdown = memo(function NotificationDropdown({
  notifications,
  unreadCount,
  isOpen,
  onOpenChange,
  onNotificationClick,
  onMarkAllRead,
  isMarkingAllRead = false,
}: NotificationDropdownProps) {
  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative h-9 w-9 rounded-lg hover:bg-slate-50 text-slate-600 shrink-0 transition-all",
            unreadCount > 0 && "text-slate-900"
          )}
        >
          <Bell className="w-[18px] h-[18px]" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-red-500 to-red-600 rounded-full ring-2 ring-white flex items-center justify-center shadow-sm"
              >
                <span className="text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[380px] sm:w-[420px] rounded-2xl p-0 bg-white border-slate-200 shadow-2xl z-[100] overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-white px-4 py-3.5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={onMarkAllRead}
                disabled={isMarkingAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {isMarkingAllRead ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Sparkles className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">All caught up!</p>
              <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
                You have no new notifications.
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => {
                const colors = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.SYSTEM;
                const icon = NOTIFICATION_ICONS[notification.type] || '📌';
                
                return (
                  <button
                    key={notification.id}
                    onClick={() => onNotificationClick(notification.id, notification.isRead)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group",
                      !notification.isRead 
                        ? "bg-gradient-to-r from-blue-50/80 via-white to-white hover:from-blue-100/80" 
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="text-2xl shrink-0">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <Badge className={cn('text-[10px] px-1.5 py-0', colors.bg, colors.text)}>
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm text-slate-800 line-clamp-1",
                        !notification.isRead && "font-semibold"
                      )}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                    </div>
                    {!notification.isRead && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-100 bg-slate-50/50">
          <Link href="/notifications">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-10 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors group"
              onClick={() => onOpenChange(false)}
            >
              View all notifications
              <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});