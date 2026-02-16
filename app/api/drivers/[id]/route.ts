// app/api/drivers/[id]/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { apiResponse } from '@/lib/api-response';
import bcrypt from 'bcryptjs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;

    const driver = await prisma.driver.findFirst({
      where: {
        id,
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
      },
    });

    if (!driver) {
      return apiResponse.notFound('Driver not found');
    }

    return apiResponse.success(driver);
  } catch (error) {
    console.error('Get driver error:', error);
    return apiResponse.error('Failed to fetch driver', 500);
  }
}

export async function PATCH(
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
    const { fullName, phone, email, password, isActive } = body;

    const driver = await prisma.driver.findFirst({
      where: {
        id,
        businessId: session.user.businessId,
        deletedAt: null,
      },
    });

    if (!driver) {
      return apiResponse.notFound('Driver not found');
    }

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone.replace(/\D/g, '');
    if (email !== undefined) updateData.email = email ? email.toLowerCase() : null;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 10);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    return apiResponse.success(updatedDriver, 'Driver updated successfully');
  } catch (error) {
    console.error('Update driver error:', error);
    return apiResponse.error('Failed to update driver', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;

    const driver = await prisma.driver.findFirst({
      where: {
        id,
        businessId: session.user.businessId,
        deletedAt: null,
      },
    });

    if (!driver) {
      return apiResponse.notFound('Driver not found');
    }

    await prisma.driver.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return apiResponse.success(null, 'Driver deleted successfully');
  } catch (error) {
    console.error('Delete driver error:', error);
    return apiResponse.error('Failed to delete driver', 500);
  }
}