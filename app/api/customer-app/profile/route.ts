// app/api/customer-app/profile/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';
import bcrypt from 'bcryptjs';

// ============================================================================
// GET /api/customer-app/profile - Get customer profile
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const fullCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        totalOrders: true,
        totalSpent: true,
        lastOrderDate: true,
        createdAt: true,
        addresses: {
          select: {
            id: true,
            label: true,
            fullAddress: true,
            landmark: true,
            city: true,
            pincode: true,
            isDefault: true,
          },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
        business: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
            phone: true,
            address: true,
            email: true,
          },
        },
      },
    });

    if (!fullCustomer) {
      return customerApiResponse.notFound('Customer not found');
    }

    return customerApiResponse.success({
      profile: {
        id: fullCustomer.id,
        fullName: fullCustomer.fullName,
        email: fullCustomer.email,
        phone: fullCustomer.phone,
        address: fullCustomer.address,
        totalOrders: fullCustomer.totalOrders,
        totalSpent: parseFloat(fullCustomer.totalSpent.toString()),
        lastOrderDate: fullCustomer.lastOrderDate?.toISOString() || null,
        memberSince: fullCustomer.createdAt.toISOString(),
        addresses: fullCustomer.addresses,
      },
      business: fullCustomer.business,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return customerApiResponse.error('Failed to fetch profile');
  }
}

// ============================================================================
// PATCH /api/customer-app/profile - Update customer profile
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const body = await req.json();
    const { fullName, email, address } = body;

    // Validation
    if (fullName !== undefined && (!fullName || fullName.trim().length < 2)) {
      return customerApiResponse.badRequest('Name must be at least 2 characters');
    }

    if (email !== undefined && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return customerApiResponse.badRequest('Invalid email format');
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        ...(fullName !== undefined && { fullName: fullName.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    return customerApiResponse.success(
      { profile: updatedCustomer },
      'Profile updated successfully'
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return customerApiResponse.error('Failed to update profile');
  }
}