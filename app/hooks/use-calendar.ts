// app/hooks/use-calendar.ts

import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '@/app/contexts/app-context';
import type { CalendarEventsResponse, CalendarFilters, CalendarEvent } from '@/app/types/calendar';

async function fetchCalendarEvents(filters: CalendarFilters): Promise<CalendarEventsResponse> {
  const params = new URLSearchParams();
  
  params.append('startDate', filters.startDate);
  params.append('endDate', filters.endDate);
  
  if (filters.storeId) {
    params.append('storeId', filters.storeId);
  }
  
  if (filters.type && filters.type !== 'all') {
    params.append('type', filters.type);
  }

  const response = await fetch(`/api/calendar/events?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch calendar events');
  }
  
  return response.json();
}

export function useCalendarEvents(filters: Omit<CalendarFilters, 'storeId'>) {
  const { selectedStoreId } = useAppContext();

  const finalFilters: CalendarFilters = {
    ...filters,
    storeId: selectedStoreId,
  };

  return useQuery({
    queryKey: ['calendar-events', finalFilters],
    queryFn: () => fetchCalendarEvents(finalFilters),
    enabled: !!selectedStoreId && !!filters.startDate && !!filters.endDate,
    staleTime: 60000,
    refetchInterval: 5 * 60000,
  });
}

export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function useEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateString = getLocalDateString(date);
  
  return events.filter(event => {
    const eventDateString = getLocalDateString(new Date(event.date));
    return eventDateString === dateString;
  });
}

export function groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const grouped: Record<string, CalendarEvent[]> = {};
  
  for (const event of events) {
    const dateKey = getLocalDateString(new Date(event.date));
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  }
  
  return grouped;
}