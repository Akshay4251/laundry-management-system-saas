// app/(dashboard)/calendar/page.tsx

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, Package, MoreHorizontal, ChevronDown, Check,
  Phone, Truck, Factory, Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCalendarEvents, groupEventsByDate, getLocalDateString, isSameDay } from '@/app/hooks/use-calendar';
import { EVENT_TYPE_CONFIG, type CalendarEvent, type CalendarEventType } from '@/app/types/calendar';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type ViewFilter = 'today' | 'week' | 'month' | 'date';

// ============================================================================
// DATE HELPER FUNCTIONS (using local timezone)
// ============================================================================

// Check if a date is in the current week (local timezone)
function isDateInCurrentWeek(date: Date): boolean {
  const today = new Date();
  
  // Get start of week (Sunday)
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Get end of week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  // Create date at start of day for comparison
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  return compareDate >= startOfWeek && compareDate <= endOfWeek;
}

// Check if a date is today (local timezone)
function isDateToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(date, today);
}

// Check if a date is in a specific month/year
function isDateInMonth(date: Date, month: number, year: number): boolean {
  return date.getMonth() === month && date.getFullYear() === year;
}

// Format date for section headers
function formatDateHeader(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  if (isSameDay(date, today)) {
    return 'Today';
  } else if (isSameDay(date, tomorrow)) {
    return 'Tomorrow';
  } else if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }
  
  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
}

// ============================================================================
// MAIN CALENDAR PAGE COMPONENT
// ============================================================================

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('month');
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<CalendarEventType | 'all'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate date range for the current month view (including padding days)
  const dateRange = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the beginning of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End at the end of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    return {
      startDate: getLocalDateString(startDate),
      endDate: getLocalDateString(endDate),
    };
  }, [year, month]);

  // Fetch calendar events
  const { data, isLoading, isError, refetch } = useCalendarEvents({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    type: eventTypeFilter,
  });

  const events = data?.data?.events || [];
  const summary = data?.data?.summary || { pickups: 0, deliveries: 0, workshopReturns: 0, total: 0 };

  // Group events by date (using local timezone)
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);

  // Calendar days calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return days;
  }, [year, month]);

  // Generate year options
  const yearOptions = useMemo(() => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 2; i <= currentYear + 3; i++) {
      years.push(i);
    }
    return years;
  }, []);

  // Get date string for a calendar day
  const getDateString = (day: number) => {
    const date = new Date(year, month, day);
    return getLocalDateString(date);
  };

  // Get events for a specific calendar day
  const getEventsForDate = (day: number): CalendarEvent[] => {
    const dateKey = getDateString(day);
    return eventsByDate[dateKey] || [];
  };

  // Check if a calendar day is today
  const isToday = (day: number) => {
    const today = new Date();
    const dayDate = new Date(year, month, day);
    return isSameDay(dayDate, today);
  };

  // Check if a calendar day is selected
  const isSelected = (day: number) => {
    if (!selectedDate || viewFilter !== 'date') return false;
    const dayDate = new Date(year, month, day);
    return isSameDay(dayDate, selectedDate);
  };

  // Check if a calendar day is in the current week
  const isInCurrentWeek = (day: number) => {
    const dayDate = new Date(year, month, day);
    return isDateInCurrentWeek(dayDate);
  };

  // =========================================================================
  // Filter events based on viewFilter (using local timezone)
  // =========================================================================
  const filteredEvents = useMemo(() => {
    const today = new Date();
    
    if (viewFilter === 'today') {
      // Show only today's events
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return isSameDay(eventDate, today);
      });
    } else if (viewFilter === 'week') {
      // Show this week's events
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return isDateInCurrentWeek(eventDate);
      });
    } else if (viewFilter === 'month') {
      // Show ALL events for the currently displayed month
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return isDateInMonth(eventDate, month, year);
      });
    } else if (viewFilter === 'date' && selectedDate) {
      // Show events for a specific selected date
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return isSameDay(eventDate, selectedDate);
      });
    }
    return [];
  }, [events, viewFilter, selectedDate, month, year]);

  // Group filtered events by date for display
  const groupedFilteredEvents = useMemo(() => {
    const grouped: { date: Date; dateStr: string; events: CalendarEvent[] }[] = [];
    const dateMap = new Map<string, { date: Date; events: CalendarEvent[] }>();
    
    for (const event of filteredEvents) {
      const eventDate = new Date(event.date);
      const dateStr = getLocalDateString(eventDate);
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { 
          date: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()), 
          events: [] 
        });
      }
      dateMap.get(dateStr)!.events.push(event);
    }
    
    // Sort dates and create grouped array
    const sortedDates = Array.from(dateMap.keys()).sort();
    for (const dateStr of sortedDates) {
      const data = dateMap.get(dateStr)!;
      grouped.push({
        date: data.date,
        dateStr,
        events: data.events.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
      });
    }
    
    return grouped;
  }, [filteredEvents]);

  // Get sidebar title based on view filter
  const getSidebarTitle = () => {
    if (viewFilter === 'today') {
      return "Today's Events";
    } else if (viewFilter === 'week') {
      return "This Week's Events";
    } else if (viewFilter === 'month') {
      return `${MONTHS[month]} ${year}`;
    } else if (viewFilter === 'date' && selectedDate) {
      return new Intl.DateTimeFormat('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(selectedDate);
    }
    return 'Select a date';
  };

  // Get empty state message
  const getEmptyMessage = () => {
    if (viewFilter === 'today') {
      return 'No events scheduled for today';
    } else if (viewFilter === 'week') {
      return 'No events scheduled this week';
    } else if (viewFilter === 'month') {
      return `No events scheduled for ${MONTHS[month]}`;
    } else if (viewFilter === 'date') {
      return 'No events for selected date';
    }
    return 'No events';
  };

  // Should show grouped view (multiple dates with headers)
  const shouldShowGroupedView = viewFilter === 'week' || viewFilter === 'month';

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(null);
    setViewFilter('today');
  };

  const handleThisWeek = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(null);
    setViewFilter('week');
  };

  const handleThisMonth = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(null);
    setViewFilter('month');
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    setViewFilter('date');
  };

  const handleYearChange = (newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1));
    setIsYearPickerOpen(false);
    if (viewFilter === 'month') {
      setSelectedDate(null);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' ? month - 1 : month + 1;
    setCurrentDate(new Date(year, newMonth, 1));
    if (viewFilter === 'month') {
      setSelectedDate(null);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    router.push(`/orders/${event.orderId}`);
  };

  // Check which filter button should be active
  const getActiveFilter = (): 'today' | 'week' | 'month' | null => {
    if (viewFilter === 'today') return 'today';
    if (viewFilter === 'week') return 'week';
    if (viewFilter === 'month') return 'month';
    return null;
  };

  const activeFilter = getActiveFilter();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="px-4 lg:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Calendar</h1>
              <p className="text-sm text-slate-500">
                {isLoading ? 'Loading...' : `${summary.total} events · ${summary.pickups} pickups · ${summary.deliveries} deliveries · ${summary.workshopReturns} workshop returns`}
              </p>
            </div>
            <div className="flex gap-2">
              {/* View Filter Buttons */}
              <button
                onClick={handleToday}
                className={cn(
                  'h-11 flex items-center justify-center px-5 gap-2 rounded-full border transition-all duration-200 font-medium text-sm',
                  activeFilter === 'today'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600'
                )}
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Today</span>
              </button>
              
              <button
                onClick={handleThisWeek}
                className={cn(
                  'h-11 flex items-center justify-center px-5 gap-2 rounded-full border transition-all duration-200 font-medium text-sm',
                  activeFilter === 'week'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600'
                )}
              >
                <span className="hidden sm:inline">This Week</span>
                <span className="sm:hidden">Week</span>
              </button>

              <button
                onClick={handleThisMonth}
                className={cn(
                  'h-11 flex items-center justify-center px-5 gap-2 rounded-full border transition-all duration-200 font-medium text-sm',
                  activeFilter === 'month'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600'
                )}
              >
                <span className="hidden sm:inline">This Month</span>
                <span className="sm:hidden">Month</span>
              </button>
            </div>
          </div>

          {/* Legend with Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => {
              const count = type === 'pickup' ? summary.pickups : 
                           type === 'delivery' ? summary.deliveries : 
                           summary.workshopReturns;
              const isActive = eventTypeFilter === 'all' || eventTypeFilter === type;
              
              return (
                <button
                  key={type}
                  onClick={() => setEventTypeFilter(
                    eventTypeFilter === type ? 'all' : type as CalendarEventType
                  )}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
                    isActive 
                      ? "bg-white border border-slate-200 shadow-sm" 
                      : "opacity-50 hover:opacity-75"
                  )}
                >
                  <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
                  <span className="text-sm text-slate-600">{config.label}</span>
                  <span className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded-full",
                    config.lightBg, config.textColor
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {MONTHS[month]}
                  </h2>
                  
                  {/* Year Picker Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <span className="font-medium">{year}</span>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        isYearPickerOpen && "rotate-180"
                      )} />
                    </button>

                    <AnimatePresence>
                      {isYearPickerOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsYearPickerOpen(false)}
                          />
                          
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 w-32"
                          >
                            <div className="max-h-64 overflow-y-auto p-1.5">
                              {yearOptions.map((yearOption) => (
                                <button
                                  key={yearOption}
                                  onClick={() => handleYearChange(yearOption)}
                                  className={cn(
                                    'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-all duration-150',
                                    year === yearOption
                                      ? 'bg-blue-50 text-blue-700 font-medium'
                                      : 'hover:bg-slate-50 text-slate-700'
                                  )}
                                >
                                  <span className="text-sm">{yearOption}</span>
                                  {year === yearOption && (
                                    <Check className="w-4 h-4 text-blue-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {isLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  )}
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleMonthChange('prev')}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMonthChange('next')}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100/50">
                {DAYS.map((day) => (
                  <div key={day} className="text-center py-3 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square border-b border-r border-slate-100 bg-slate-50/30" />;
                  }

                  const dayEvents = getEventsForDate(day);
                  const today = isToday(day);
                  const selected = isSelected(day);
                  const inWeek = isInCurrentWeek(day);
                  
                  // Highlight based on current view
                  const highlighted = 
                    (activeFilter === 'week' && inWeek) || 
                    (activeFilter === 'today' && today);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "aspect-square border-b border-r border-slate-100 p-2 transition-all relative group hover:bg-slate-50",
                        selected && "bg-blue-50 ring-1 ring-inset ring-blue-200",
                        !selected && highlighted && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex flex-col h-full">
                        <span
                          className={cn(
                            "text-sm font-medium mb-1 transition-all",
                            today && "w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center",
                            !today && selected && "text-blue-600 font-semibold",
                            !today && !selected && highlighted && "text-blue-600 font-medium",
                            !today && !selected && !highlighted && "text-slate-700 group-hover:text-slate-900"
                          )}
                        >
                          {day}
                        </span>

                        {dayEvents.length > 0 && (
                          <div className="flex flex-col gap-1 mt-auto">
                            {dayEvents.slice(0, 3).map((event) => {
                              const config = EVENT_TYPE_CONFIG[event.type];
                              return (
                                <div
                                  key={event.id}
                                  className={cn(
                                    "h-1 rounded-full transition-all",
                                    config.color,
                                    "group-hover:h-1.5"
                                  )}
                                  title={event.title}
                                />
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <span className="text-[10px] font-medium text-slate-500 text-center">
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[700px]">
            {/* Sidebar Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100/30">
              <h3 className="font-semibold text-slate-900 mb-1">
                {getSidebarTitle()}
              </h3>
              <p className="text-xs text-slate-600">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} scheduled
              </p>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                  <p className="text-sm text-slate-500">Loading events...</p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                    <AlertCircle className="w-7 h-7 text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Failed to load events</p>
                  <button
                    onClick={() => refetch()}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {filteredEvents.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                        <CalendarIcon className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-1">No events</p>
                      <p className="text-xs text-slate-500 mb-4 text-center">
                        {getEmptyMessage()}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={viewFilter + (selectedDate?.getTime() || '') + month + year}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {shouldShowGroupedView ? (
                        groupedFilteredEvents.map(({ date, dateStr, events: dayEvents }) => (
                          <div key={dateStr}>
                            {/* Date Header */}
                            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-1 z-10">
                              <div className={cn(
                                "text-xs font-semibold px-2 py-1 rounded-full",
                                isDateToday(date) 
                                  ? "bg-blue-600 text-white" 
                                  : "bg-slate-100 text-slate-700"
                              )}>
                                {formatDateHeader(date)}
                              </div>
                              <div className="flex-1 h-px bg-slate-200" />
                              <span className="text-xs text-slate-500">
                                {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                              </span>
                            </div>
                            
                            {/* Events for this date */}
                            <div className="space-y-2">
                              {dayEvents.map((event, index) => (
                                <EventCard 
                                  key={event.id} 
                                  event={event} 
                                  index={index}
                                  onClick={() => handleEventClick(event)}
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="space-y-3">
                          {filteredEvents.map((event, index) => (
                            <EventCard 
                              key={event.id} 
                              event={event} 
                              index={index}
                              onClick={() => handleEventClick(event)}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EVENT CARD COMPONENT
// ============================================================================

interface EventCardProps {
  event: CalendarEvent;
  index: number;
  onClick: () => void;
}

function EventCard({ event, index, onClick }: EventCardProps) {
  const config = EVENT_TYPE_CONFIG[event.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      <div className={cn(
        "p-4 rounded-xl border transition-all",
        "border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white"
      )}>
        {/* Event Type Bar */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", config.color)} />

        {/* Event Header */}
        <div className="flex items-start justify-between gap-3 mb-2 ml-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-900 text-sm truncate">
                {event.customer || event.orderNumber}
              </h4>
              {event.isExpress && (
                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">
                  EXPRESS
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-600">{event.time}</span>
            </div>
          </div>
          <button 
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Event Details */}
        <div className="space-y-1.5 ml-3">
          {event.customerPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-600">{event.customerPhone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-600 font-mono">{event.orderNumber}</span>
          </div>
          {event.workshopPartnerName && (
            <div className="flex items-center gap-2">
              <Factory className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-600">
                {event.workshopPartnerName} ({event.workshopItemsCount} items)
              </span>
            </div>
          )}
          {event.itemCount && !event.workshopItemsCount && (
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-600">{event.itemCount} items</span>
            </div>
          )}
        </div>

        {/* Event Type Badge & Amount */}
        <div className="mt-3 ml-3 flex items-center justify-between">
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
            config.lightBg,
            config.textColor,
            config.borderColor
          )}>
            {event.type === 'pickup' && <Truck className="w-3 h-3 mr-1" />}
            {event.type === 'delivery' && <Truck className="w-3 h-3 mr-1" />}
            {event.type === 'workshop_return' && <Factory className="w-3 h-3 mr-1" />}
            {config.label}
          </span>
          {event.totalAmount && (
            <span className="text-sm font-semibold text-slate-900">
              ₹{event.totalAmount.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}