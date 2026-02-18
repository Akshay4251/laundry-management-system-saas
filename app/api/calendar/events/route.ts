// app/api/calendar/events/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return errorResponse('Business not found', 404);
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const storeId = searchParams.get('storeId');
    const eventType = searchParams.get('type') || 'all';

    if (!startDateParam || !endDateParam) {
      return errorResponse('startDate and endDate are required', 400);
    }

    const startDate = new Date(startDateParam);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(endDateParam);
    endDate.setHours(23, 59, 59, 999);

    const events: any[] = [];

    // Base store filter
    const storeFilter = storeId ? { storeId } : {};

    // =========================================================================
    // 1. PICKUP EVENTS - Orders scheduled for pickup
    // =========================================================================
    if (eventType === 'all' || eventType === 'pickup') {
      const pickupOrders = await prisma.order.findMany({
        where: {
          businessId,
          ...storeFilter,
          orderType: 'PICKUP',
          status: { in: ['PICKUP', 'IN_PROGRESS'] }, // Not yet picked up or just received
          pickupDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          pickupDate: 'asc',
        },
      });

      for (const order of pickupOrders) {
        if (order.pickupDate) {
          events.push({
            id: `pickup-${order.id}`,
            title: `Pickup - ${order.customer.fullName}`,
            type: 'pickup',
            date: order.pickupDate.toISOString(),
            time: formatTime(order.pickupDate),
            customer: order.customer.fullName,
            customerPhone: order.customer.phone,
            orderId: order.id,
            orderNumber: order.orderNumber,
            orderStatus: order.status,
            storeId: order.store.id,
            storeName: order.store.name,
            itemCount: order._count.items,
            totalAmount: parseFloat(order.totalAmount.toString()),
            isExpress: order.priority === 'EXPRESS',
          });
        }
      }
    }

    // =========================================================================
    // 2. DELIVERY EVENTS - Orders scheduled for delivery
    // =========================================================================
    if (eventType === 'all' || eventType === 'delivery') {
      const deliveryOrders = await prisma.order.findMany({
        where: {
          businessId,
          ...storeFilter,
          status: { in: ['READY', 'OUT_FOR_DELIVERY'] },
          deliveryDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              address: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          deliveryDate: 'asc',
        },
      });

      for (const order of deliveryOrders) {
        if (order.deliveryDate) {
          events.push({
            id: `delivery-${order.id}`,
            title: `Delivery - ${order.customer.fullName}`,
            type: 'delivery',
            date: order.deliveryDate.toISOString(),
            time: formatTime(order.deliveryDate),
            customer: order.customer.fullName,
            customerPhone: order.customer.phone,
            customerAddress: order.customer.address,
            orderId: order.id,
            orderNumber: order.orderNumber,
            orderStatus: order.status,
            storeId: order.store.id,
            storeName: order.store.name,
            itemCount: order._count.items,
            totalAmount: parseFloat(order.totalAmount.toString()),
            isExpress: order.priority === 'EXPRESS',
          });
        }
      }
    }

    // =========================================================================
    // 3. WORKSHOP RETURN EVENTS - Items expected back from workshop
    // =========================================================================
    if (eventType === 'all' || eventType === 'workshop_return') {
      const workshopItems = await prisma.orderItem.findMany({
        where: {
          order: {
            businessId,
            ...storeFilter,
          },
          status: 'AT_WORKSHOP',
          sentToWorkshop: true,
          workshopSentDate: { not: null },
        },
        include: {
          order: {
            include: {
              customer: {
                select: {
                  id: true,
                  fullName: true,
                  phone: true,
                },
              },
              store: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          service: {
            select: {
              turnaroundHours: true,
            },
          },
        },
      });

      // Group by order and calculate expected return date
      const workshopOrderMap = new Map<string, {
        order: any;
        items: any[];
        expectedReturnDate: Date;
      }>();

      for (const item of workshopItems) {
        if (!item.workshopSentDate) continue;

        // Calculate expected return date
        const turnaroundHours = item.service?.turnaroundHours || 48; // Default 48 hours
        const expectedReturn = new Date(item.workshopSentDate);
        expectedReturn.setHours(expectedReturn.getHours() + turnaroundHours);

        // Only include if expected return is within date range
        if (expectedReturn >= startDate && expectedReturn <= endDate) {
          const orderId = item.order.id;
          
          if (!workshopOrderMap.has(orderId)) {
            workshopOrderMap.set(orderId, {
              order: item.order,
              items: [],
              expectedReturnDate: expectedReturn,
            });
          }
          
          const orderData = workshopOrderMap.get(orderId)!;
          orderData.items.push(item);
          
          // Use the latest expected return date
          if (expectedReturn > orderData.expectedReturnDate) {
            orderData.expectedReturnDate = expectedReturn;
          }
        }
      }

      for (const [orderId, data] of workshopOrderMap) {
        const workshopPartners = [...new Set(
          data.items
            .map(item => item.workshopPartnerName)
            .filter(Boolean)
        )];

        events.push({
          id: `workshop-${orderId}`,
          title: `Workshop Return - ${data.order.orderNumber}`,
          type: 'workshop_return',
          date: data.expectedReturnDate.toISOString(),
          time: formatTime(data.expectedReturnDate),
          customer: data.order.customer.fullName,
          customerPhone: data.order.customer.phone,
          orderId: data.order.id,
          orderNumber: data.order.orderNumber,
          orderStatus: data.order.status,
          storeId: data.order.store.id,
          storeName: data.order.store.name,
          workshopItemsCount: data.items.length,
          workshopPartnerName: workshopPartners.join(', ') || 'External Workshop',
        });
      }
    }

    // Sort all events by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate summary
    const summary = {
      pickups: events.filter(e => e.type === 'pickup').length,
      deliveries: events.filter(e => e.type === 'delivery').length,
      workshopReturns: events.filter(e => e.type === 'workshop_return').length,
      total: events.length,
    };

    return successResponse({ events, summary });
  } catch (error) {
    console.error('Calendar events fetch error:', error);
    return errorResponse('Failed to fetch calendar events', 500);
  }
}

// Helper function to format time
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}