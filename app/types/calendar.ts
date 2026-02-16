// app/types/calendar.ts

export type CalendarEventType = 'pickup' | 'delivery' | 'workshop_return';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // ISO date string
  time: string; // Formatted time like "09:00 AM"
  customer?: string;
  customerPhone?: string;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  storeId: string;
  storeName: string;
  itemCount?: number;
  totalAmount?: number;
  isExpress?: boolean;
  // Workshop specific
  workshopPartnerName?: string;
  workshopItemsCount?: number;
}

export interface CalendarEventsResponse {
  success: boolean;
  data: {
    events: CalendarEvent[];
    summary: {
      pickups: number;
      deliveries: number;
      workshopReturns: number;
      total: number;
    };
  };
}

export interface CalendarFilters {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  storeId?: string;
  type?: CalendarEventType | 'all';
}

export const EVENT_TYPE_CONFIG: Record<CalendarEventType, {
  label: string;
  color: string;
  bgColor: string;
  lightBg: string;
  textColor: string;
  borderColor: string;
}> = {
  pickup: {
    label: 'Pickup',
    color: 'bg-green-600',
    bgColor: 'bg-green-600',
    lightBg: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  delivery: {
    label: 'Delivery',
    color: 'bg-blue-600',
    bgColor: 'bg-blue-600',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  workshop_return: {
    label: 'Workshop Return',
    color: 'bg-orange-600',
    bgColor: 'bg-orange-600',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
};