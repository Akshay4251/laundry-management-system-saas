// app/api/delivery-app/orders/[id]/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverApiResponse, handleDriverCorsPreflightRequest } from '@/lib/driver-api-response';
import { authenticateDriver } from '@/lib/driver-auth';

export async function OPTIONS() {
  return handleDriverCorsPreflightRequest();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const driver = await authenticateDriver(req);
    if (!driver) {
      return driverApiResponse.unauthorized();
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        driverId: driver.id,
        businessId: driver.businessId,
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
            color: true,
            brand: true,
            notes: true,
          },
        },
      },
    });

    if (!order) {
      return driverApiResponse.notFound('Order not found');
    }

    // Transform to flatten customerAddress into address field
    const transformedOrder = {
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
        color: item.color,
        brand: item.brand,
        notes: item.notes,
      })),
    };

    return driverApiResponse.success(transformedOrder);
  } catch (error) {
    console.error('Get order error:', error);
    return driverApiResponse.error('Failed to fetch order');
  }
}