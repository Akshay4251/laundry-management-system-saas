// app/api/customer-app/profile/change-password/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';
import { invalidateAllRefreshTokens } from '@/lib/customer-jwt';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return customerApiResponse.badRequest('Current and new password are required');
    }

    if (newPassword.length < 6) {
      return customerApiResponse.badRequest('New password must be at least 6 characters');
    }

    // Get customer with password
    const fullCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
      select: { passwordHash: true },
    });

    if (!fullCustomer?.passwordHash) {
      return customerApiResponse.badRequest('Password not set');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, fullCustomer.passwordHash);
    if (!isValid) {
      return customerApiResponse.badRequest('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate all refresh tokens (force re-login on other devices)
    await invalidateAllRefreshTokens(customer.id);

    return customerApiResponse.success(null, 'Password changed successfully. Please login again on other devices.');
  } catch (error) {
    console.error('Change password error:', error);
    return customerApiResponse.error('Failed to change password');
  }
}