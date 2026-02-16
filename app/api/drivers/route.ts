// app/api/drivers/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { apiResponse } from '@/lib/api-response';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const drivers = await prisma.driver.findMany({
      where: {
        businessId: session.user.businessId,
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            assignedOrders: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const driversWithStats = drivers.map(driver => ({
      id: driver.id,
      fullName: driver.fullName,
      phone: driver.phone,
      email: driver.email,
      isActive: driver.isActive,
      createdAt: driver.createdAt,
      completedOrders: driver._count.assignedOrders,
    }));

    return apiResponse.success(driversWithStats);
  } catch (error) {
    console.error('Get drivers error:', error);
    return apiResponse.error('Failed to fetch drivers', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const body = await req.json();
    const { fullName, phone, email, password } = body;

    if (!fullName || !phone || !password) {
      return apiResponse.badRequest('Name, phone, and password are required');
    }

    const cleanPhone = phone.replace(/\D/g, '');

    const existingDriver = await prisma.driver.findFirst({
      where: {
        businessId: session.user.businessId,
        OR: [
          { phone: cleanPhone },
          ...(email ? [{ email: email.toLowerCase() }] : []),
        ],
        deletedAt: null,
      },
    });

    if (existingDriver) {
      return apiResponse.conflict('Driver with this phone or email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const driver = await prisma.driver.create({
      data: {
        businessId: session.user.businessId,
        fullName,
        phone: cleanPhone,
        email: email ? email.toLowerCase() : null,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    return apiResponse.created(driver, 'Driver created successfully');
  } catch (error) {
    console.error('Create driver error:', error);
    return apiResponse.error('Failed to create driver', 500);
  }
}