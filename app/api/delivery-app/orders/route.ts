// app/api/delivery-app/orders/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverApiResponse, handleDriverCorsPreflightRequest } from '@/lib/driver-api-response';
import { authenticateDriver } from '@/lib/driver-auth';

export async function OPTIONS() {
  return handleDriverCorsPreflightRequest();
}

export async function GET(req: NextRequest) {
  try {
    const driver = await authenticateDriver(req);
    if (!driver) {
      return driverApiResponse.unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let statusFilter: any = {};

    if (type === 'pickup') {
      // Only PICKUP - once picked up (IN_PROGRESS), it's at the store
      statusFilter = { status: 'PICKUP' };
    } else if (type === 'delivery') {
      statusFilter = { status: { in: ['READY', 'OUT_FOR_DELIVERY'] } };
    } else if (type === 'history') {
      // History includes completed AND orders the driver picked up (IN_PROGRESS+)
      statusFilter = {
        OR: [
          { status: 'COMPLETED' },
          { status: 'IN_PROGRESS', pickedUpAt: { not: null } },
        ],
      };
    } else {
      // Active tasks: only PICKUP, READY, OUT_FOR_DELIVERY
      // IN_PROGRESS with pickedUpAt means driver already picked up → not active for driver
      statusFilter = { status: { in: ['PICKUP', 'READY', 'OUT_FOR_DELIVERY'] } };
    }

    const orders = await prisma.order.findMany({
      where: {
        driverId: driver.id,
        businessId: driver.businessId,
        ...statusFilter,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            address: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        customerAddress: {
          select: {
            id: true,
            label: true,
            fullAddress: true,
            landmark: true,
            city: true,
            pincode: true,
            latitude: true,
            longitude: true,
          },
        },
        items: {
          select: {
            id: true,
            itemName: true,
            serviceName: true,
            quantity: true,
            unitPrice: true,
            subtotal: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: type === 'history' ? 'desc' : 'asc',
      },
      take: type === 'history' ? 50 : undefined,
    });

    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      paidAmount: order.paidAmount.toString(),
      paymentStatus: order.paymentStatus,
      priority: order.priority,
      pickupDate: order.pickupDate?.toISOString() || null,
      deliveryDate: order.deliveryDate?.toISOString() || null,
      pickedUpAt: order.pickedUpAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      specialInstructions: order.specialInstructions,
      createdAt: order.createdAt.toISOString(),
      customer: order.customer,
      store: order.store,
      address: order.customerAddress || null,
      items: order.items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        serviceName: item.serviceName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        subtotal: item.subtotal.toString(),
        status: item.status,
      })),
    }));

    return driverApiResponse.success(transformedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    return driverApiResponse.error('Failed to fetch orders');
  }
}