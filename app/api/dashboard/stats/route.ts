// app/api/dashboard/stats/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { OrderStatus } from '@prisma/client';

// Helper to get local date string
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get start of day in local timezone
function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

// Helper to get end of day in local timezone
function getEndOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

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
    const storeId = searchParams.get('storeId');
    const timeRange = (searchParams.get('timeRange') || 'week') as 'week' | 'month' | 'year';

    const storeFilter = storeId ? { storeId } : {};
    
    const now = new Date();
    const today = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);

    // Calculate date ranges
    let currentStart: Date;
    let previousStart: Date;
    let previousEnd: Date;

    switch (timeRange) {
      case 'week':
        currentStart = new Date(today);
        currentStart.setDate(currentStart.getDate() - 7);
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 7);
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);
        break;
      case 'month':
        currentStart = new Date(today);
        currentStart.setMonth(currentStart.getMonth() - 1);
        previousStart = new Date(currentStart);
        previousStart.setMonth(previousStart.getMonth() - 1);
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);
        break;
      case 'year':
        currentStart = new Date(today);
        currentStart.setFullYear(currentStart.getFullYear() - 1);
        previousStart = new Date(currentStart);
        previousStart.setFullYear(previousStart.getFullYear() - 1);
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);
        break;
    }

    // =========================================================================
    // FETCH STATS
    // =========================================================================

    // Current period revenue & orders
    const currentOrders = await prisma.order.findMany({
      where: {
        businessId,
        ...storeFilter,
        createdAt: { gte: currentStart, lte: todayEnd },
        status: { not: 'CANCELLED' },
      },
      select: {
        totalAmount: true,
        paidAmount: true,
      },
    });

    const currentRevenue = currentOrders.reduce(
      (sum, order) => sum + parseFloat(order.paidAmount.toString()),
      0
    );
    const currentOrderCount = currentOrders.length;

    // Previous period revenue & orders
    const previousOrders = await prisma.order.findMany({
      where: {
        businessId,
        ...storeFilter,
        createdAt: { gte: previousStart, lte: previousEnd },
        status: { not: 'CANCELLED' },
      },
      select: {
        totalAmount: true,
        paidAmount: true,
      },
    });

    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + parseFloat(order.paidAmount.toString()),
      0
    );
    const previousOrderCount = previousOrders.length;

    // Active customers (customers with orders in current period)
    const currentCustomers = await prisma.order.findMany({
      where: {
        businessId,
        ...storeFilter,
        createdAt: { gte: currentStart, lte: todayEnd },
        status: { not: 'CANCELLED' },
      },
      select: {
        customerId: true,
      },
      distinct: ['customerId'],
    });

    const previousCustomers = await prisma.order.findMany({
      where: {
        businessId,
        ...storeFilter,
        createdAt: { gte: previousStart, lte: previousEnd },
        status: { not: 'CANCELLED' },
      },
      select: {
        customerId: true,
      },
      distinct: ['customerId'],
    });

    // Pending orders (not completed or cancelled)
    const pendingOrders = await prisma.order.count({
      where: {
        businessId,
        ...storeFilter,
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
    });

    const previousPendingOrders = await prisma.order.count({
      where: {
        businessId,
        ...storeFilter,
        createdAt: { lte: previousEnd },
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
    });

    // =========================================================================
    // QUICK STATS - Today's pickups, deliveries, pending actions
    // =========================================================================

    const todayPickups = await prisma.order.count({
      where: {
        businessId,
        ...storeFilter,
        orderType: 'PICKUP',
        pickupDate: { gte: today, lte: todayEnd },
        status: { in: ['PICKUP', 'IN_PROGRESS'] },
      },
    });

    const todayDeliveries = await prisma.order.count({
      where: {
        businessId,
        ...storeFilter,
        deliveryDate: { gte: today, lte: todayEnd },
        status: { in: ['READY', 'OUT_FOR_DELIVERY'] },
      },
    });

    const pendingActions = await prisma.order.count({
      where: {
        businessId,
        ...storeFilter,
        OR: [
          { status: 'PICKUP' },
          { status: 'WORKSHOP_RETURNED' },
          {
            status: 'READY',
            deliveryDate: { lte: todayEnd },
          },
        ],
      },
    });

    // =========================================================================
    // REVENUE CHART DATA
    // =========================================================================

    const revenueData = await getRevenueChartData(
      businessId,
      storeFilter,
      timeRange,
      currentStart,
      todayEnd
    );

    // =========================================================================
    // ORDER STATUS DISTRIBUTION
    // =========================================================================

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: {
        businessId,
        ...storeFilter,
        createdAt: { gte: currentStart },
      },
      _count: true,
    });

    const totalStatusCount = statusCounts.reduce((sum, s) => sum + s._count, 0);

    const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
      PICKUP: { label: 'Pickup', color: '#f59e0b' },
      IN_PROGRESS: { label: 'In Progress', color: '#3b82f6' },
      AT_WORKSHOP: { label: 'At Workshop', color: '#8b5cf6' },
      WORKSHOP_RETURNED: { label: 'Workshop Returned', color: '#a855f7' },
      READY: { label: 'Ready', color: '#22c55e' },
      OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#6366f1' },
      COMPLETED: { label: 'Completed', color: '#10b981' },
      CANCELLED: { label: 'Cancelled', color: '#ef4444' },
    };

    const statusDistribution = statusCounts.map((s) => ({
      status: s.status,
      label: statusConfig[s.status].label,
      count: s._count,
      percentage: totalStatusCount > 0 ? Math.round((s._count / totalStatusCount) * 100) : 0,
      color: statusConfig[s.status].color,
    }));

    // =========================================================================
    // RECENT ORDERS
    // =========================================================================

    const recentOrders = await prisma.order.findMany({
      where: {
        businessId,
        ...storeFilter,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    const transformedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        id: order.customer.id,
        fullName: order.customer.fullName,
        phone: order.customer.phone,
      },
      itemCount: order._count.items,
      totalAmount: parseFloat(order.totalAmount.toString()),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }));

    // =========================================================================
    // CALCULATE CHANGES
    // =========================================================================

    const calculateChange = (current: number, previous: number): { change: number; trend: 'up' | 'down' } => {
      if (previous === 0) {
        return { change: current > 0 ? 100 : 0, trend: 'up' };
      }
      const change = ((current - previous) / previous) * 100;
      return {
        change: Math.abs(Math.round(change * 10) / 10),
        trend: change >= 0 ? 'up' : 'down',
      };
    };

    const revenueChange = calculateChange(currentRevenue, previousRevenue);
    const ordersChange = calculateChange(currentOrderCount, previousOrderCount);
    const customersChange = calculateChange(currentCustomers.length, previousCustomers.length);
    const pendingChange = calculateChange(pendingOrders, previousPendingOrders);

    // =========================================================================
    // BUILD RESPONSE
    // =========================================================================

    const data = {
      stats: {
        revenue: {
          total: Math.round(currentRevenue),
          ...revenueChange,
        },
        orders: {
          total: currentOrderCount,
          ...ordersChange,
        },
        customers: {
          active: currentCustomers.length,
          ...customersChange,
        },
        pending: {
          count: pendingOrders,
          ...pendingChange,
        },
      },
      quickStats: {
        todayPickups,
        todayDeliveries,
        pendingActions,
      },
      revenueChart: revenueData,
      statusDistribution,
      recentOrders: transformedRecentOrders,
    };

    return successResponse(data);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return errorResponse('Failed to fetch dashboard stats', 500);
  }
}

// =========================================================================
// HELPER: Get Revenue Chart Data
// =========================================================================

async function getRevenueChartData(
  businessId: string,
  storeFilter: object,
  timeRange: 'week' | 'month' | 'year',
  startDate: Date,
  endDate: Date
): Promise<{ date: string; label: string; revenue: number; orders: number }[]> {
  const orders = await prisma.order.findMany({
    where: {
      businessId,
      ...storeFilter,
      createdAt: { gte: startDate, lte: endDate },
      status: { not: 'CANCELLED' },
    },
    select: {
      paidAmount: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const dataMap = new Map<string, { revenue: number; orders: number }>();

  // Initialize data points based on time range
  const current = new Date(startDate);
  while (current <= endDate) {
    let key: string;
    let label: string;

    if (timeRange === 'week') {
      key = getLocalDateString(current);
      label = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(current);
      current.setDate(current.getDate() + 1);
    } else if (timeRange === 'month') {
      key = getLocalDateString(current);
      label = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(current);
      current.setDate(current.getDate() + 1);
    } else {
      // Year - group by month
      key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      label = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(current);
      current.setMonth(current.getMonth() + 1);
    }

    if (!dataMap.has(key)) {
      dataMap.set(key, { revenue: 0, orders: 0 });
    }
  }

  // Aggregate order data
  for (const order of orders) {
    let key: string;

    if (timeRange === 'year') {
      key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = getLocalDateString(order.createdAt);
    }

    const existing = dataMap.get(key);
    if (existing) {
      existing.revenue += parseFloat(order.paidAmount.toString());
      existing.orders += 1;
    }
  }

  // Convert to array and add labels
  const result: { date: string; label: string; revenue: number; orders: number }[] = [];
  
  const sortedKeys = Array.from(dataMap.keys()).sort();
  for (const key of sortedKeys) {
    const data = dataMap.get(key)!;
    let label: string;

    if (timeRange === 'year') {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      label = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    } else if (timeRange === 'week') {
      const date = new Date(key);
      label = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    } else {
      const date = new Date(key);
      label = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date);
    }

    result.push({
      date: key,
      label,
      revenue: Math.round(data.revenue),
      orders: data.orders,
    });
  }

  return result;
}