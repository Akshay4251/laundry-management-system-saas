// app/api/customer-app/orders/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';
import { OrderStatus, Prisma } from '@prisma/client';
import { generateOrderNumber, createOrderWithRetry } from '@/lib/order-utils';

// ============================================================================
// GET /api/customer-app/orders - List customer orders
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      customerId: customer.id,
      businessId: customer.businessId,
    };

    if (statusParam === 'active') {
      where.status = {
        notIn: ['COMPLETED', 'CANCELLED'],
      };
    } else if (statusParam === 'completed') {
      where.status = {
        in: ['COMPLETED', 'CANCELLED'],
      };
    } else if (statusParam && statusParam !== 'all') {
      const validStatuses: OrderStatus[] = [
        'PICKUP',
        'IN_PROGRESS',
        'AT_WORKSHOP',
        'WORKSHOP_RETURNED',
        'READY',
        'OUT_FOR_DELIVERY',
        'COMPLETED',
        'CANCELLED',
      ];
      if (validStatuses.includes(statusParam as OrderStatus)) {
        where.status = statusParam as OrderStatus;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
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
              status: true,
              unitPrice: true,
              subtotal: true,
              isExpress: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      priority: order.priority,
      isExpress: order.priority === 'EXPRESS',
      store: order.store,
      address: order.customerAddress,
      items: order.items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        serviceName: item.serviceName,
        quantity: item.quantity,
        status: item.status,
        unitPrice: parseFloat(item.unitPrice.toString()),
        subtotal: parseFloat(item.subtotal.toString()),
        isExpress: item.isExpress,
      })),
      itemsCount: order._count.items,
      totalQuantity: order.items.reduce((sum: number, item) => sum + item.quantity, 0),
      subtotal: order.subtotal ? parseFloat(order.subtotal.toString()) : null,
      gstAmount: order.gstAmount ? parseFloat(order.gstAmount.toString()) : null,
      discount: order.discount ? parseFloat(order.discount.toString()) : null,
      totalAmount: parseFloat(order.totalAmount.toString()),
      paidAmount: parseFloat(order.paidAmount.toString()),
      dueAmount: parseFloat(order.totalAmount.toString()) - parseFloat(order.paidAmount.toString()),
      pickupDate: order.pickupDate?.toISOString() || null,
      deliveryDate: order.deliveryDate?.toISOString() || null,
      completedDate: order.completedDate?.toISOString() || null,
      specialInstructions: order.specialInstructions,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    return customerApiResponse.success({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return customerApiResponse.error('Failed to fetch orders');
  }
}

// ============================================================================
// POST /api/customer-app/orders - Create pickup order
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const body = await req.json();
    const {
      storeId,
      addressId,
      pickupDate,
      pickupTimeSlot,
      deliveryDate,
      deliveryTimeSlot,
      specialInstructions,
      estimatedItems,
    } = body;

    // Validation
    if (!pickupDate) {
      return customerApiResponse.badRequest('Pickup date is required');
    }

    if (!pickupTimeSlot) {
      return customerApiResponse.badRequest('Pickup time slot is required');
    }

    // Verify store belongs to business
    let store;
    if (storeId) {
      store = await prisma.store.findFirst({
        where: {
          id: storeId,
          businessId: customer.businessId,
          isActive: true,
        },
      });
    } else {
      store = await prisma.store.findFirst({
        where: {
          businessId: customer.businessId,
          isActive: true,
        },
      });
    }

    if (!store) {
      return customerApiResponse.badRequest('No active store found');
    }

    // Get address if provided
    let pickupAddress: string | null = null;
    let validAddressId: string | null = null;

    if (addressId) {
      const address = await prisma.customerAddress.findFirst({
        where: {
          id: addressId,
          customerId: customer.id,
        },
      });
      if (address) {
        validAddressId = address.id;
        pickupAddress = [
          address.fullAddress,
          address.landmark,
          `${address.city} - ${address.pincode}`,
        ].filter(Boolean).join(', ');

        const existingCustomer = await prisma.customer.findUnique({
          where: { id: customer.id },
          select: { address: true },
        });
        if (!existingCustomer?.address) {
          await prisma.customer.update({
            where: { id: customer.id },
            data: { address: pickupAddress },
          });
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CREATE ORDER WITH RETRY (shared logic handles collisions with dashboard)
    // ═══════════════════════════════════════════════════════════════════════

    const result = await createOrderWithRetry(async () => {
      const orderNumber = await generateOrderNumber(customer.businessId, store.id);

      const newOrder = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            businessId: customer.businessId,
            storeId: store.id,
            customerId: customer.id,
            orderNumber,
            orderType: 'PICKUP',
            status: 'PICKUP',
            priority: 'NORMAL',
            subtotal: 0,
            totalAmount: 0,
            paidAmount: 0,
            paymentStatus: 'UNPAID',
            pickupDate: new Date(pickupDate),
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            addressId: validAddressId,
            specialInstructions: [
              pickupAddress ? `Pickup Address: ${pickupAddress}` : null,
              `Pickup Time: ${pickupTimeSlot}`,
              deliveryTimeSlot ? `Delivery Time: ${deliveryTimeSlot}` : null,
              estimatedItems ? `Estimated Items: ${estimatedItems}` : null,
              specialInstructions || null,
            ].filter(Boolean).join('\n'),
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: created.id,
            toStatus: 'PICKUP',
            changedBy: 'customer-app',
            notes: `Pickup scheduled via customer app for ${new Date(pickupDate).toLocaleDateString()}`,
          },
        });

        return created;
      });

      return { order: newOrder, orderNumber };
    });

    if (!result.success) {
      return customerApiResponse.error(result.error);
    }

    const { order } = result.data;

    // Fetch complete order for response
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
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
      },
    });

    return customerApiResponse.success({
      order: {
        id: completeOrder!.id,
        orderNumber: completeOrder!.orderNumber,
        orderType: completeOrder!.orderType,
        status: completeOrder!.status,
        store: completeOrder!.store,
        address: completeOrder!.customerAddress,
        pickupDate: completeOrder!.pickupDate?.toISOString(),
        deliveryDate: completeOrder!.deliveryDate?.toISOString(),
        specialInstructions: completeOrder!.specialInstructions,
        createdAt: completeOrder!.createdAt.toISOString(),
      },
    }, 'Pickup scheduled successfully! We will collect your items soon.');
  } catch (error) {
    console.error('Create order error:', error);
    return customerApiResponse.error('Failed to schedule pickup');
  }
}