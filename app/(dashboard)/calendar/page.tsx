'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
  Clock, User, Package, MoreHorizontal, ChevronDown, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'delivery' | 'pickup' | 'workshop_return' | 'appointment';
  time: string;
  customer?: string;
  orderId?: string;
}

const MOCK_EVENTS: Record<string, CalendarEvent[]> = {
  // November 2025
  '2025-11-03': [
    { id: 'nov1', title: 'Pickup - Rajesh Kumar', type: 'pickup', time: '09:00 AM', customer: 'Rajesh Kumar', orderId: 'ORD-2025-001' },
    { id: 'nov2', title: 'Delivery - Priya Sharma', type: 'delivery', time: '02:00 PM', customer: 'Priya Sharma', orderId: 'ORD-2025-002' },
  ],
  '2025-11-05': [
    { id: 'nov3', title: 'Workshop Return Expected', type: 'workshop_return', time: '11:00 AM', orderId: 'ORD-2025-003' },
  ],
  '2025-11-07': [
    { id: 'nov4', title: 'Delivery - Amit Patel', type: 'delivery', time: '10:30 AM', customer: 'Amit Patel', orderId: 'ORD-2025-004' },
    { id: 'nov5', title: 'Customer Consultation', type: 'appointment', time: '03:00 PM', customer: 'New Customer' },
  ],
  '2025-11-10': [
    { id: 'nov6', title: 'Pickup - Sneha Reddy', type: 'pickup', time: '09:00 AM', customer: 'Sneha Reddy', orderId: 'ORD-2025-005' },
  ],
  '2025-11-12': [
    { id: 'nov7', title: 'Delivery - Vikram Singh', type: 'delivery', time: '11:00 AM', customer: 'Vikram Singh', orderId: 'ORD-2025-006' },
    { id: 'nov8', title: 'Wedding Dress Pickup', type: 'pickup', time: '04:00 PM', customer: 'Ananya Iyer', orderId: 'ORD-2025-007' },
  ],
  '2025-11-14': [
    { id: 'nov9', title: 'Bulk Order Pickup', type: 'pickup', time: '08:00 AM', customer: 'Hotel Grand Plaza', orderId: 'ORD-2025-008' },
  ],
  '2025-11-17': [
    { id: 'nov10', title: 'Delivery - Kavya Nair', type: 'delivery', time: '10:00 AM', customer: 'Kavya Nair', orderId: 'ORD-2025-009' },
    { id: 'nov11', title: 'Workshop Return', type: 'workshop_return', time: '01:00 PM', orderId: 'ORD-2025-010' },
  ],
  '2025-11-19': [
    { id: 'nov12', title: 'Pickup - Rohan Desai', type: 'pickup', time: '09:30 AM', customer: 'Rohan Desai', orderId: 'ORD-2025-011' },
  ],
  '2025-11-21': [
    { id: 'nov13', title: 'Delivery - Meera Krishnan', type: 'delivery', time: '11:30 AM', customer: 'Meera Krishnan', orderId: 'ORD-2025-012' },
    { id: 'nov14', title: 'Quality Check Appointment', type: 'appointment', time: '03:00 PM', customer: 'QC Team' },
  ],
  '2025-11-24': [
    { id: 'nov15', title: 'Restaurant Linens Pickup', type: 'pickup', time: '07:00 AM', customer: 'The Blue Lotus', orderId: 'ORD-2025-013' },
    { id: 'nov16', title: 'Delivery - Sanjay Gupta', type: 'delivery', time: '02:30 PM', customer: 'Sanjay Gupta', orderId: 'ORD-2025-014' },
  ],
  '2025-11-26': [
    { id: 'nov17', title: 'Workshop Return', type: 'workshop_return', time: '12:00 PM', orderId: 'ORD-2025-015' },
  ],
  '2025-11-28': [
    { id: 'nov18', title: 'Pickup - Deepika Rao', type: 'pickup', time: '09:00 AM', customer: 'Deepika Rao', orderId: 'ORD-2025-016' },
    { id: 'nov19', title: 'Delivery - Aditya Kumar', type: 'delivery', time: '04:00 PM', customer: 'Aditya Kumar', orderId: 'ORD-2025-017' },
    { id: 'nov20', title: 'Business Consultation', type: 'appointment', time: '05:30 PM', customer: 'Corporate Client' },
  ],
  // December 2025
  '2025-12-01': [
    { id: 'dec1', title: 'Month Start Pickup', type: 'pickup', time: '08:00 AM', customer: 'Neha Kapoor', orderId: 'ORD-2025-018' },
  ],
  '2025-12-03': [
    { id: 'dec2', title: 'Delivery - Karthik Subramanian', type: 'delivery', time: '10:00 AM', customer: 'Karthik Subramanian', orderId: 'ORD-2025-019' },
    { id: 'dec3', title: 'Workshop Return', type: 'workshop_return', time: '02:00 PM', orderId: 'ORD-2025-020' },
  ],
  '2025-12-05': [
    { id: 'dec4', title: 'Pickup - Pooja Malhotra', type: 'pickup', time: '09:30 AM', customer: 'Pooja Malhotra', orderId: 'ORD-2025-021' },
  ],
  '2025-12-08': [
    { id: 'dec5', title: 'Delivery - Rahul Verma', type: 'delivery', time: '11:00 AM', customer: 'Rahul Verma', orderId: 'ORD-2025-022' },
    { id: 'dec6', title: 'Corporate Pickup', type: 'pickup', time: '03:00 PM', customer: 'Tech Park Plaza', orderId: 'ORD-2025-023' },
  ],
  '2025-12-10': [
    { id: 'dec7', title: 'Winter Collection Consultation', type: 'appointment', time: '11:00 AM', customer: 'Fashion Event' },
  ],
  '2025-12-12': [
    { id: 'dec8', title: 'Delivery - Simran Singh', type: 'delivery', time: '10:00 AM', customer: 'Simran Singh', orderId: 'ORD-2025-024' },
    { id: 'dec9', title: 'Workshop Return', type: 'workshop_return', time: '01:30 PM', orderId: 'ORD-2025-025' },
  ],
  '2025-12-15': [
    { id: 'dec10', title: 'Pickup - Harish Patel', type: 'pickup', time: '09:00 AM', customer: 'Harish Patel', orderId: 'ORD-2025-026' },
    { id: 'dec11', title: 'Delivery - Lakshmi Menon', type: 'delivery', time: '02:00 PM', customer: 'Lakshmi Menon', orderId: 'ORD-2025-027' },
  ],
  '2025-12-17': [
    { id: 'dec12', title: 'Hotel Linens Bulk Pickup', type: 'pickup', time: '07:00 AM', customer: 'Luxury Hotel', orderId: 'ORD-2025-028' },
  ],
  '2025-12-19': [
    { id: 'dec13', title: 'Delivery - Suresh Rajan', type: 'delivery', time: '10:30 AM', customer: 'Suresh Rajan', orderId: 'ORD-2025-029' },
    { id: 'dec14', title: 'Year-End Review Meeting', type: 'appointment', time: '04:00 PM', customer: 'Management' },
  ],
  '2025-12-22': [
    { id: 'dec15', title: 'Pickup - Anjali Deshmukh', type: 'pickup', time: '09:00 AM', customer: 'Anjali Deshmukh', orderId: 'ORD-2025-030' },
    { id: 'dec16', title: 'Workshop Return', type: 'workshop_return', time: '12:00 PM', orderId: 'ORD-2025-031' },
  ],
  '2025-12-24': [
    { id: 'dec17', title: 'Christmas Eve Delivery', type: 'delivery', time: '09:00 AM', customer: 'Madhav Krishna', orderId: 'ORD-2025-032' },
    { id: 'dec18', title: 'Holiday Special Pickup', type: 'pickup', time: '11:00 AM', customer: 'Varun Malhotra', orderId: 'ORD-2025-033' },
  ],
  '2025-12-26': [
    { id: 'dec19', title: 'Delivery - Divya Nambiar', type: 'delivery', time: '10:00 AM', customer: 'Divya Nambiar', orderId: 'ORD-2025-034' },
  ],
  '2025-12-29': [
    { id: 'dec20', title: 'Pickup - Ravi Shankar', type: 'pickup', time: '09:30 AM', customer: 'Ravi Shankar', orderId: 'ORD-2025-035' },
    { id: 'dec21', title: 'Workshop Return', type: 'workshop_return', time: '02:00 PM', orderId: 'ORD-2025-036' },
  ],
  '2025-12-31': [
    { id: 'dec22', title: 'New Year Eve Delivery', type: 'delivery', time: '08:00 AM', customer: 'Jennifer Martin', orderId: 'ORD-2025-037' },
    { id: 'dec23', title: 'Year-End Consultation', type: 'appointment', time: '03:00 PM', customer: 'VIP Client' },
    { id: 'dec24', title: 'Final Pickup of Year', type: 'pickup', time: '05:00 PM', customer: 'Sarah Johnson', orderId: 'ORD-2025-038' },
  ],
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const EVENT_TYPES = {
  delivery: { color: 'bg-blue-600', label: 'Delivery', lightBg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  pickup: { color: 'bg-green-600', label: 'Pickup', lightBg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  workshop_return: { color: 'bg-orange-600', label: 'Workshop', lightBg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  appointment: { color: 'bg-purple-600', label: 'Appointment', lightBg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

type ViewFilter = 'today' | 'week' | 'month';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2025, 10, 3));
  const [viewFilter, setViewFilter] = useState<ViewFilter>('month');
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [isMobileEventsOpen, setIsMobileEventsOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = 2020; i <= 2030; i++) {
      years.push(i);
    }
    return years;
  }, []);

  const getDateString = (day: number) => 
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsForDate = (day: number) => MOCK_EVENTS[getDateString(day)] || [];

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  const isInCurrentWeek = (day: number) => {
    const today = new Date();
    const dayDate = new Date(year, month, day);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return dayDate >= startOfWeek && dayDate <= endOfWeek;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate.getDate()) : [];

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setViewFilter('today');
  };

  const handleThisWeek = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setViewFilter('week');
  };

  const handleThisMonth = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setViewFilter('month');
  };

  const handleYearChange = (newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1));
    setIsYearPickerOpen(false);
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(year, month, day));
    const events = getEventsForDate(day);
    if (events.length > 0) {
      setIsMobileEventsOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* Title Row */}
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5 sm:mb-1">Calendar</h1>
                <p className="text-xs sm:text-sm text-slate-500">Manage deliveries, pickups & appointments</p>
              </div>
              
              {/* Add Event Button - Always visible */}
              <button
                className={cn(
                  'h-10 sm:h-11 flex items-center justify-center px-3 sm:px-5 gap-1.5 sm:gap-2 rounded-full transition-all duration-200',
                  'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm shrink-0'
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">New Event</span>
              </button>
            </div>

            {/* Filter Buttons - Scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
              <button
                onClick={handleToday}
                className={cn(
                  'h-9 sm:h-10 flex items-center justify-center px-3 sm:px-4 gap-1.5 rounded-full border transition-all duration-200 font-medium text-xs sm:text-sm whitespace-nowrap shrink-0',
                  viewFilter === 'today'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600'
                )}
              >
                <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Today
              </button>
              
              <button
                onClick={handleThisWeek}
                className={cn(
                  'h-9 sm:h-10 flex items-center justify-center px-3 sm:px-4 gap-1.5 rounded-full border transition-all duration-200 font-medium text-xs sm:text-sm whitespace-nowrap shrink-0',
                  viewFilter === 'week'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600'
                )}
              >
                This Week
              </button>

              <button
                onClick={handleThisMonth}
                className={cn(
                  'h-9 sm:h-10 flex items-center justify-center px-3 sm:px-4 gap-1.5 rounded-full border transition-all duration-200 font-medium text-xs sm:text-sm whitespace-nowrap shrink-0',
                  viewFilter === 'month'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600'
                )}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Legend - Scrollable on mobile */}
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
            {Object.entries(EVENT_TYPES).map(([type, config]) => (
              <div key={type} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", config.color)} />
                <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    <span className="hidden sm:inline">{MONTHS[month]}</span>
                    <span className="sm:hidden">{MONTHS_SHORT[month]}</span>
                  </h2>
                  
                  {/* Year Picker */}
                  <div className="relative">
                    <button
                      onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                      className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <span className="text-sm sm:text-base font-medium">{year}</span>
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform",
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
                            className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 w-28 sm:w-32"
                          >
                            <div className="max-h-48 sm:max-h-64 overflow-y-auto p-1 sm:p-1.5">
                              {yearOptions.map((yearOption) => (
                                <button
                                  key={yearOption}
                                  onClick={() => handleYearChange(yearOption)}
                                  className={cn(
                                    'w-full flex items-center justify-between gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-left transition-all duration-150',
                                    year === yearOption
                                      ? 'bg-blue-50 text-blue-700 font-medium'
                                      : 'hover:bg-slate-50 text-slate-700'
                                  )}
                                >
                                  <span className="text-xs sm:text-sm">{yearOption}</span>
                                  {year === yearOption && (
                                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex gap-0.5 sm:gap-1">
                  <button
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100/50">
                {DAYS.map((day, index) => (
                  <div key={day} className="text-center py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{DAYS_SHORT[index]}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square border-b border-r border-slate-100 bg-slate-50/30" />;
                  }

                  const events = getEventsForDate(day);
                  const today = isToday(day);
                  const selected = isSelected(day);
                  const inWeek = isInCurrentWeek(day);
                  const highlighted = (viewFilter === 'week' && inWeek) || (viewFilter === 'today' && today);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={cn(
                        "aspect-square border-b border-r border-slate-100 p-0.5 sm:p-1.5 md:p-2 transition-all relative group hover:bg-slate-50",
                        selected && "bg-blue-50 ring-1 ring-inset ring-blue-200",
                        highlighted && !selected && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex flex-col h-full">
                        {/* Day Number */}
                        <span
                          className={cn(
                            "text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 transition-all mx-auto",
                            today && "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] sm:text-xs",
                            !today && selected && "text-blue-600 font-semibold",
                            !today && !selected && highlighted && "text-blue-600 font-medium",
                            !today && !selected && !highlighted && "text-slate-700 group-hover:text-slate-900"
                          )}
                        >
                          {day}
                        </span>

                        {/* Event Indicators */}
                        {events.length > 0 && (
                          <div className="flex flex-col gap-0.5 mt-auto px-0.5">
                            {/* Mobile: Show dots */}
                            <div className="flex justify-center gap-0.5 sm:hidden">
                              {events.slice(0, 3).map((event) => {
                                const config = EVENT_TYPES[event.type];
                                return (
                                  <div
                                    key={event.id}
                                    className={cn("w-1.5 h-1.5 rounded-full", config.color)}
                                  />
                                );
                              })}
                              {events.length > 3 && (
                                <span className="text-[8px] font-bold text-slate-400">+</span>
                              )}
                            </div>
                            
                            {/* Desktop: Show bars */}
                            <div className="hidden sm:flex flex-col gap-0.5">
                              {events.slice(0, 2).map((event) => {
                                const config = EVENT_TYPES[event.type];
                                return (
                                  <div
                                    key={event.id}
                                    className={cn(
                                      "h-1 md:h-1.5 rounded-full transition-all",
                                      config.color,
                                      "group-hover:scale-y-110"
                                    )}
                                    title={event.title}
                                  />
                                );
                              })}
                              {events.length > 2 && (
                                <span className="text-[9px] md:text-[10px] font-medium text-slate-500 text-center">
                                  +{events.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Events Sidebar - Desktop */}
          <div className="hidden lg:flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden max-h-[600px] xl:max-h-[700px]">
            <EventsSidebar 
              selectedDate={selectedDate}
              events={selectedDateEvents}
            />
          </div>

          {/* Selected Date Summary - Mobile (Always visible) */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileEventsOpen(true)}
              className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 text-sm">
                      {selectedDate
                        ? new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(selectedDate)
                        : 'Select a date'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedDateEvents.length > 0 && (
                    <div className="flex -space-x-1">
                      {selectedDateEvents.slice(0, 3).map((event) => {
                        const config = EVENT_TYPES[event.type];
                        return (
                          <div
                            key={event.id}
                            className={cn("w-3 h-3 rounded-full border-2 border-white", config.color)}
                          />
                        );
                      })}
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Events Sheet */}
      <AnimatePresence>
        {isMobileEventsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileEventsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
            />
            
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-slate-300" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {selectedDate
                      ? new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(selectedDate)
                      : 'Events'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'}
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileEventsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Events List */}
              <div className="flex-1 overflow-y-auto p-4">
                <EventsList events={selectedDateEvents} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Events Sidebar Component (Desktop)
function EventsSidebar({ selectedDate, events }: { selectedDate: Date | null; events: CalendarEvent[] }) {
  return (
    <>
      {/* Header */}
      <div className="px-4 xl:px-5 py-3 xl:py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100/30 shrink-0">
        <h3 className="font-semibold text-slate-900 text-sm xl:text-base mb-0.5 xl:mb-1">
          {selectedDate
            ? new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(selectedDate)
            : 'Select a date'}
        </h3>
        <p className="text-xs text-slate-600">
          {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
        </p>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-3 xl:p-4">
        <EventsList events={events} />
      </div>
    </>
  );
}

// Events List Component (Shared between desktop and mobile)
function EventsList({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-8 sm:py-12"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-900 mb-1">No events</p>
        <p className="text-xs text-slate-500 mb-4 text-center px-4">Schedule deliveries or appointments</p>
        <button className="h-9 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4 inline mr-1.5" />
          Add Event
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {events.map((event, index) => {
        const config = EVENT_TYPES[event.type];
        
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
          >
            <div className={cn(
              "p-3 sm:p-4 rounded-xl border transition-all",
              "border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white"
            )}>
              {/* Event Type Bar */}
              <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", config.color)} />

              {/* Event Header */}
              <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 ml-2.5 sm:ml-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 text-sm mb-1 truncate">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-600">{event.time}</span>
                  </div>
                </div>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Event Details */}
              {(event.customer || event.orderId) && (
                <div className="space-y-1.5 sm:space-y-2 ml-2.5 sm:ml-3">
                  {event.customer && (
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-600 truncate">{event.customer}</span>
                    </div>
                  )}
                  {event.orderId && (
                    <div className="flex items-center gap-2">
                      <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-600 font-mono">{event.orderId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Event Type Badge */}
              <div className="mt-2.5 sm:mt-3 ml-2.5 sm:ml-3">
                <span className={cn(
                  "inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border",
                  config.lightBg,
                  config.text,
                  config.border
                )}>
                  {config.label}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}