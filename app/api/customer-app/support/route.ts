// app/api/customer-app/support/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';

// Default FAQs
const DEFAULT_FAQS = [
  {
    id: '1',
    question: 'How do I schedule a pickup?',
    answer: 'Go to the Home screen and tap "Schedule Pickup". Select your preferred date, time slot, and address. Our team will arrive during the selected time window.',
  },
  {
    id: '2',
    question: 'What are your operating hours?',
    answer: 'We typically operate Monday to Saturday, 9 AM to 9 PM. Check the booking screen for available time slots.',
  },
  {
    id: '3',
    question: 'How can I track my order?',
    answer: 'Go to the Orders tab to see all your orders. Tap on any order to view its current status and timeline.',
  },
  {
    id: '4',
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash, Card, UPI, and Online payments. You can pay at the time of delivery or pickup.',
  },
  {
    id: '5',
    question: 'How do I cancel a pickup?',
    answer: 'You can cancel a scheduled pickup from the order details screen before items are collected.',
  },
  {
    id: '6',
    question: 'What if my clothes are damaged?',
    answer: 'We take utmost care of your garments. In case of any damage, please contact us immediately and we will resolve the issue.',
  },
];

// ============================================================================
// GET /api/customer-app/support - Get support info and FAQs
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    // Get business contact info
    const business = await prisma.business.findUnique({
      where: { id: customer.businessId },
      select: {
        businessName: true,
        phone: true,
        email: true,
        address: true,
      },
    });

    if (!business) {
      return customerApiResponse.notFound('Business not found');
    }

    return customerApiResponse.success({
      business: {
        name: business.businessName,
        phone: business.phone,
        email: business.email,
        address: business.address,
      },
      faqs: DEFAULT_FAQS,
      supportHours: 'Monday - Saturday, 9:00 AM - 9:00 PM',
    });
  } catch (error) {
    console.error('Get support error:', error);
    return customerApiResponse.error('Failed to fetch support info');
  }
}