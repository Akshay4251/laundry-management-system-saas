// app/types/notification.ts

export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_COMPLETED'
  | 'ORDER_READY'
  | 'ORDER_PICKED_UP'
  | 'ORDER_DELIVERED'
  | 'PAYMENT_RECEIVED'
  | 'LOW_STOCK'
  | 'NEW_CUSTOMER'
  | 'REWORK_REQUESTED'
  | 'WORKSHOP_RETURNED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  businessId: string;
  userId?: string | null;
  storeId?: string | null;
  type: NotificationType;
  title: string;
  message?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  isRead: boolean;
  readAt?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
}

// Notification type display config
export const notificationTypeConfig: Record<NotificationType, {
  icon: string;
  color: string;
  bgColor: string;
}> = {
  ORDER_CREATED: { icon: 'ShoppingBag', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  ORDER_COMPLETED: { icon: 'CheckCircle', color: 'text-green-600', bgColor: 'bg-green-50' },
  ORDER_READY: { icon: 'Package', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  ORDER_PICKED_UP: { icon: 'Truck', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ORDER_DELIVERED: { icon: 'MapPin', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  PAYMENT_RECEIVED: { icon: 'CreditCard', color: 'text-green-600', bgColor: 'bg-green-50' },
  LOW_STOCK: { icon: 'AlertTriangle', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  NEW_CUSTOMER: { icon: 'UserPlus', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  REWORK_REQUESTED: { icon: 'RotateCcw', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  WORKSHOP_RETURNED: { icon: 'ArrowLeftRight', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  SYSTEM: { icon: 'Bell', color: 'text-slate-600', bgColor: 'bg-slate-50' },
};