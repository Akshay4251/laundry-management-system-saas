// app/api/subscription/billing-history/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.error('Business not found');
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      return apiResponse.success({
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      prisma.subscriptionPayment.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.subscriptionPayment.count({
        where: { subscriptionId: subscription.id },
      }),
    ]);

    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
    });

    // Map invoices to payment IDs for lookup
    const invoiceMap = new Map(
      invoices.map((inv) => [inv.id, inv])
    );

    const billingHistory = payments.map((payment) => ({
      id: payment.id,
      date: payment.paidAt || payment.createdAt,
      description: payment.description || `${subscription.planType} Plan Payment`,
      amount: parseFloat(payment.amount.toString()),
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      cardLast4: payment.cardLast4,
      cardBrand: payment.cardBrand,
      razorpayPaymentId: payment.razorpayPaymentId,
    }));

    return apiResponse.success({
      items: billingHistory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    return apiResponse.error('Failed to fetch billing history');
  }
}