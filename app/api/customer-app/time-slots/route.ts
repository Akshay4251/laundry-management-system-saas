// app/api/customer-app/time-slots/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';

interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}

// Default time slots
const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: 'morning', label: 'Morning', startTime: '09:00', endTime: '12:00' },
  { id: 'afternoon', label: 'Afternoon', startTime: '12:00', endTime: '15:00' },
  { id: 'evening', label: 'Evening', startTime: '15:00', endTime: '18:00' },
  { id: 'late_evening', label: 'Late Evening', startTime: '18:00', endTime: '21:00' },
];

// Default operating days (1 = Monday, 7 = Sunday)
const DEFAULT_OPERATING_DAYS = [1, 2, 3, 4, 5, 6]; // Mon-Sat

// ============================================================================
// GET /api/customer-app/time-slots - Get available time slots
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');

    // Get business operating hours
    const operatingHours = await prisma.businessOperatingHours.findUnique({
      where: { businessId: customer.businessId },
    });

    // Parse time slots from JSON with proper type handling
    let timeSlots: TimeSlot[] = DEFAULT_TIME_SLOTS;
    if (operatingHours?.timeSlots) {
      try {
        // Handle both string and object cases
        const parsed = typeof operatingHours.timeSlots === 'string' 
          ? JSON.parse(operatingHours.timeSlots)
          : operatingHours.timeSlots;
        
        if (Array.isArray(parsed)) {
          timeSlots = parsed as TimeSlot[];
        }
      } catch {
        // Use defaults if parsing fails
        timeSlots = DEFAULT_TIME_SLOTS;
      }
    }

    const operatingDays = operatingHours?.operatingDays || DEFAULT_OPERATING_DAYS;
    const minPickupHoursAdvance = operatingHours?.minPickupHoursAdvance || 2;
    const maxPickupDaysAdvance = operatingHours?.maxPickupDaysAdvance || 7;

    // Calculate available dates
    const today = new Date();
    const availableDates: { date: string; dayName: string; dayNumber: number; isToday: boolean }[] = [];

    for (let i = 0; i <= maxPickupDaysAdvance; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();
      // Convert to 1-7 (Monday = 1, Sunday = 7)
      const dayNumber = dayOfWeek === 0 ? 7 : dayOfWeek;

      if (operatingDays.includes(dayNumber)) {
        availableDates.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate(),
          isToday: i === 0,
        });
      }
    }

    // Get available time slots for specific date
    let availableTimeSlots = timeSlots;
    if (dateStr) {
      const requestedDate = new Date(dateStr);
      const now = new Date();

      // If same day, filter out past time slots
      if (requestedDate.toDateString() === now.toDateString()) {
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = currentHour + currentMinutes / 60;

        availableTimeSlots = timeSlots.filter((slot) => {
          const [startHour, startMin] = slot.startTime.split(':').map(Number);
          const slotStartTime = startHour + startMin / 60;

          // Slot must start at least minPickupHoursAdvance hours from now
          return slotStartTime >= currentTime + minPickupHoursAdvance;
        });
      }
    }

    return customerApiResponse.success({
      timeSlots: availableTimeSlots,
      availableDates,
      settings: {
        minPickupHoursAdvance,
        maxPickupDaysAdvance,
        operatingDays,
      },
    });
  } catch (error) {
    console.error('Get time slots error:', error);
    return customerApiResponse.error('Failed to fetch time slots');
  }
}