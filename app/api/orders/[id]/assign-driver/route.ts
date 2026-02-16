// app/api/orders/[id]/assign-driver/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { apiResponse } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const body = await req.json();
    const { driverId } = body;

    const order = await prisma.order.findFirst({
      where: {
        id,
        businessId: session.user.businessId,
      },
    });

    if (!order) {
      return apiResponse.notFound('Order not found');
    }

    if (driverId) {
      const driver = await prisma.driver.findFirst({
        where: {
          id: driverId,
          businessId: session.user.businessId,
          isActive: true,
          deletedAt: null,
        },
      });

      if (!driver) {
        return apiResponse.notFound('Driver not found');
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        driverId: driverId || null,
        assignedAt: driverId ? new Date() : null,
      },
      include: {
        driver: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return apiResponse.success(
      updatedOrder, 
      driverId ? 'Driver assigned successfully' : 'Driver unassigned'
    );
  } catch (error) {
    console.error('Assign driver error:', error);
    return apiResponse.error('Failed to assign driver', 500);
  }
}