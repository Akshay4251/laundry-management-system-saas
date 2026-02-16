// app/api/customer-app/orders/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';
import { OrderStatus, Prisma } from '@prisma/client';

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

    // Build where clause
    const where: Prisma.OrderWhereInput = {
      customerId: customer.id,
      businessId: customer.businessId,
    };

    // Filter by status
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

    // Fetch orders
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
              treatmentName: true,
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

    // Transform orders
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
        treatmentName: item.treatmentName,
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

    // Get address if provided and validate it belongs to this customer
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

        // Also update the customer's main address field if it's empty
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

    // Generate order number
    const orderNumber = await generateOrderNumber(customer.businessId, store.id);

    // Create pickup order
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
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
          // Link the customer address to the order
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

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          toStatus: 'PICKUP',
          changedBy: 'customer-app',
          notes: `Pickup scheduled via customer app for ${new Date(pickupDate).toLocaleDateString()}`,
        },
      });

      return newOrder;
    });

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

// Helper function to generate order number
async function generateOrderNumber(businessId: string, storeId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { name: true },
  });

  const storeCode = store?.name
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'STR';

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const todayOrderCount = await prisma.order.count({
    where: {
      businessId,
      storeId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const sequenceNumber = (todayOrderCount + 1).toString().padStart(4, '0');
  return `${storeCode}-${year}${month}${day}-${sequenceNumber}`;
}