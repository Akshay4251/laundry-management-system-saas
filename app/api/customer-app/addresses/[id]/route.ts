// app/api/customer-app/addresses/[id]/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';

// ============================================================================
// Helper: Sync default address → customer.address field
// Duplicated here to avoid circular import issues in Next.js route handlers.
// ============================================================================

async function syncDefaultAddressToCustomer(customerId: string): Promise<void> {
  const defaultAddress = await prisma.customerAddress.findFirst({
    where: { customerId, isDefault: true },
    orderBy: { updatedAt: 'desc' },
  });

  if (defaultAddress) {
    const formatted = [
      defaultAddress.fullAddress,
      defaultAddress.landmark,
      `${defaultAddress.city} - ${defaultAddress.pincode}`,
    ]
      .filter(Boolean)
      .join(', ');

    await prisma.customer.update({
      where: { id: customerId },
      data: { address: formatted },
    });
  } else {
    const anyAddress = await prisma.customerAddress.findFirst({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    if (anyAddress) {
      await prisma.customerAddress.update({
        where: { id: anyAddress.id },
        data: { isDefault: true },
      });

      const formatted = [
        anyAddress.fullAddress,
        anyAddress.landmark,
        `${anyAddress.city} - ${anyAddress.pincode}`,
      ]
        .filter(Boolean)
        .join(', ');

      await prisma.customer.update({
        where: { id: customerId },
        data: { address: formatted },
      });
    }
  }
}

// ============================================================================
// PATCH /api/customer-app/addresses/[id] - Update address
// ============================================================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const { id } = await params;
    const body = await req.json();
    const { label, fullAddress, landmark, city, pincode, isDefault, latitude, longitude } = body;

    // Verify address belongs to customer
    const existingAddress = await prisma.customerAddress.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!existingAddress) {
      return customerApiResponse.notFound('Address not found');
    }

    // If setting as default, unset others first
    if (isDefault && !existingAddress.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: customer.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.customerAddress.update({
      where: { id },
      data: {
        ...(label !== undefined && { label: label.trim() }),
        ...(fullAddress !== undefined && { fullAddress: fullAddress.trim() }),
        ...(landmark !== undefined && { landmark: landmark?.trim() || null }),
        ...(city !== undefined && { city: city.trim() }),
        ...(pincode !== undefined && { pincode: pincode.trim() }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    // Sync to customer.address if this is/was the default, or if fields changed on the default
    const updatedAddress = await prisma.customerAddress.findUnique({ where: { id } });
    if (updatedAddress?.isDefault || existingAddress.isDefault) {
      await syncDefaultAddressToCustomer(customer.id);
    }

    return customerApiResponse.success({ address }, 'Address updated successfully');
  } catch (error) {
    console.error('Update address error:', error);
    return customerApiResponse.error('Failed to update address');
  }
}

// ============================================================================
// DELETE /api/customer-app/addresses/[id] - Delete address
// ============================================================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const { id } = await params;

    // Verify address belongs to customer
    const address = await prisma.customerAddress.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!address) {
      return customerApiResponse.notFound('Address not found');
    }

    // Check if this address is linked to any active orders
    const linkedOrders = await prisma.order.count({
      where: {
        addressId: id,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    });

    if (linkedOrders > 0) {
      return customerApiResponse.badRequest(
        'This address is linked to active orders. It cannot be deleted until those orders are completed.'
      );
    }

    // Remove addressId from completed/cancelled orders (set to null)
    await prisma.order.updateMany({
      where: { addressId: id },
      data: { addressId: null },
    });

    // Delete the address
    await prisma.customerAddress.delete({ where: { id } });

    // If deleted address was default, promote another and sync
    if (address.isDefault) {
      await syncDefaultAddressToCustomer(customer.id);
    }

    return customerApiResponse.success({ id }, 'Address deleted successfully');
  } catch (error) {
    console.error('Delete address error:', error);
    return customerApiResponse.error('Failed to delete address');
  }
}