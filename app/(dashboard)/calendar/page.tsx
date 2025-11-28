'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
  Clock, User, Package, MoreHorizontal, ChevronDown, Check
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
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EVENT_TYPES = {
  delivery: { color: 'bg-blue-600', label: 'Delivery', lightBg: 'bg-blue-50', text: 'text-blue-700' },
  pickup: { color: 'bg-green-600', label: 'Pickup', lightBg: 'bg-green-50', text: 'text-green-700' },
  workshop_return: { color: 'bg-orange-600', label: 'Workshop Return', lightBg: 'bg-orange-50', text: 'text-orange-700' },
  appointment: { color: 'bg-purple-600', label: 'Appointment', lightBg: 'bg-purple-50', text: 'text-purple-700' },
};

type ViewFilter = 'today' | 'week' | 'month';

export default function CalendarPage() {
  // Start calendar at November 2025 where we have data
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // November 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2025, 10, 3)); // Nov 3 has events
  const [viewFilter, setViewFilter] = useState<ViewFilter>('month');
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

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

  // Generate year options (2020-2030)
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

  // Check if date is in current week
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="px-4 lg:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Calendar</h1>
              <p className="text-sm text-slate-500">Manage deliveries, pickups & appointments</p>
            </div>
            <div className="flex gap-2">
              {/* Filter Buttons */}
              <button
                onClick={handleToday}
                className={cn(
                  'h-11 flex items-center justify-center px-5 gap-2 rounded-full border transition-all duration-200 font-medium text-sm',
                  viewFilter === 'today'
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
                  viewFilter === 'week'
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
                  viewFilter === 'month'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600'
                )}
              >
                <span className="hidden sm:inline">This Month</span>
                <span className="sm:hidden">Month</span>
              </button>

              <button
                className={cn(
                  'h-11 flex items-center justify-center px-5 gap-2 rounded-full transition-all duration-200',
                  'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm'
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Event</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4">
            {Object.entries(EVENT_TYPES).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
                <span className="text-sm text-slate-600">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Calendar Header with Year Picker */}
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
                          {/* Backdrop */}
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
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
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

                  const events = getEventsForDate(day);
                  const today = isToday(day);
                  const selected = isSelected(day);
                  const inWeek = isInCurrentWeek(day);
                  const highlighted = (viewFilter === 'week' && inWeek) || (viewFilter === 'today' && today);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(year, month, day))}
                      className={cn(
                        "aspect-square border-b border-r border-slate-100 p-2 transition-all relative group hover:bg-slate-50",
                        selected && "bg-blue-50 ring-1 ring-inset ring-blue-200",
                        highlighted && !selected && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex flex-col h-full">
                        {/* Day Number */}
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

                        {/* Event Indicators */}
                        {events.length > 0 && (
                          <div className="flex flex-col gap-1 mt-auto">
                            {events.slice(0, 3).map((event) => {
                              const config = EVENT_TYPES[event.type];
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
                            {events.length > 3 && (
                              <span className="text-[10px] font-medium text-slate-500 text-center">
                                +{events.length - 3}
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
                {selectedDate
                  ? new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(selectedDate)
                  : 'Select a date'}
              </h3>
              <p className="text-xs text-slate-600">
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'} scheduled
              </p>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {selectedDateEvents.length === 0 ? (
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
                    <p className="text-xs text-slate-500 mb-4 text-center">Schedule deliveries or appointments for this day</p>
                    <button className="h-9 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm">
                      <Plus className="w-4 h-4 inline mr-1.5" />
                      Add Event
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {selectedDateEvents.map((event, index) => {
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
                            "p-4 rounded-xl border transition-all",
                            "border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white"
                          )}>
                            {/* Event Type Bar */}
                            <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", config.color)} />

                            {/* Event Header */}
                            <div className="flex items-start justify-between gap-3 mb-3 ml-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 text-sm mb-1 truncate">
                                  {event.title}
                                </h4>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-xs text-slate-600">{event.time}</span>
                                </div>
                              </div>
                              <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                              </button>
                            </div>

                            {/* Event Details */}
                            {(event.customer || event.orderId) && (
                              <div className="space-y-2 ml-3">
                                {event.customer && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs text-slate-600">{event.customer}</span>
                                  </div>
                                )}
                                {event.orderId && (
                                  <div className="flex items-center gap-2">
                                    <Package className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs text-slate-600 font-mono">{event.orderId}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Event Type Badge */}
                            <div className="mt-3 ml-3">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                                config.lightBg,
                                config.text,
                                "border-" + config.color.replace('bg-', '')
                              )}>
                                {config.label}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}