// app/api/workshop/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.notFound('Business not found');
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const tab = searchParams.get('tab') as 'processing' | 'ready' | 'history' | null;

    const baseWhere = {
      order: {
        businessId,
        ...(storeId && { storeId }),
      },
      sentToWorkshop: true,
    };

    let tabWhere = {};
    switch (tab) {
      case 'processing':
        tabWhere = { 
          status: 'AT_WORKSHOP',  // ✅ FIXED: Use Prisma enum
          workshopReturnedDate: null,
        };
        break;
      case 'ready':
        tabWhere = { 
          status: 'WORKSHOP_RETURNED',  // ✅ FIXED: Use Prisma enum
        };
        break;
      case 'history':
        tabWhere = { 
          status: { in: ['READY', 'COMPLETED'] },  // ✅ FIXED: Use Prisma enum
          workshopReturnedDate: { not: null },
        };
        break;
      default:
        tabWhere = { 
          status: 'AT_WORKSHOP',  // ✅ FIXED: Use Prisma enum
          workshopReturnedDate: null,
        };
    }

    const items = await prisma.orderItem.findMany({
      where: { ...baseWhere, ...tabWhere },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            priority: true,
            status: true,
            customer: {
              select: { id: true, fullName: true, phone: true },
            },
            store: {
              select: { id: true, name: true },
            },
          },
        },
        item: {
          select: { id: true, name: true, iconUrl: true, category: true },
        },
        treatment: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: [
        { order: { priority: 'desc' } },
        { workshopSentDate: 'asc' },
      ],
    });

    const [processingCount, readyCount, returnedTodayCount] = await Promise.all([
      prisma.orderItem.count({
        where: { 
          ...baseWhere, 
          status: 'AT_WORKSHOP',  // ✅ FIXED
          workshopReturnedDate: null,
        },
      }),
      prisma.orderItem.count({
        where: { 
          ...baseWhere, 
          status: 'WORKSHOP_RETURNED',  // ✅ FIXED
        },
      }),
      prisma.orderItem.count({
        where: {
          ...baseWhere,
          workshopReturnedDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const transformedItems = items.map((item) => ({
      id: item.id,
      tagNumber: item.tagNumber,
      itemName: item.itemName,
      itemIcon: item.item?.iconUrl || null,
      itemCategory: item.item?.category || null,
      treatmentName: item.treatmentName || item.treatment?.name || null,
      quantity: item.quantity,
      status: item.status,
      isExpress: item.isExpress,
      color: item.color,
      brand: item.brand,
      notes: item.notes,
      workshopPartnerName: item.workshopPartnerName,
      workshopSentDate: item.workshopSentDate?.toISOString() || null,
      workshopReturnedDate: item.workshopReturnedDate?.toISOString() || null,
      workshopNotes: item.workshopNotes,
      order: {
        id: item.order.id,
        orderNumber: item.order.orderNumber,
        status: item.order.status,
        priority: item.order.priority,
        customer: item.order.customer,
        store: item.order.store,
      },
      createdAt: item.createdAt.toISOString(),
    }));

    return apiResponse.success({
      items: transformedItems,
      stats: {
        atWorkshop: processingCount,  // ✅ Renamed for clarity
        returned: readyCount,          // ✅ Renamed for clarity
        returnedToday: returnedTodayCount,
      },
    });
  } catch (error) {
    console.error('Error fetching workshop items:', error);
    return apiResponse.error('Failed to fetch workshop items');
  }
}