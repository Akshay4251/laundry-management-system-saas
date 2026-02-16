// app/api/customer-app/addresses/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerApiResponse } from '@/lib/customer-api-response';
import { authenticateCustomer } from '@/lib/customer-auth';

// ============================================================================
// Helper: Sync default address → customer.address field
// This keeps the Customer.address string in sync with CustomerAddress records
// so the dashboard and delivery app always see the latest address.
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
    // No addresses left — check if there's any address at all
    const anyAddress = await prisma.customerAddress.findFirst({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    if (anyAddress) {
      // Make the most recent one the default and sync
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
    // If no addresses at all, don't clear customer.address
    // (it may have been set manually from dashboard)
  }
}

// ============================================================================
// GET /api/customer-app/addresses - List all addresses
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return customerApiResponse.success({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    return customerApiResponse.error('Failed to fetch addresses');
  }
}

// ============================================================================
// POST /api/customer-app/addresses - Create new address
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return customerApiResponse.unauthorized();
    }

    const body = await req.json();
    const { label, fullAddress, landmark, city, pincode, isDefault, latitude, longitude } = body;

    // Validation
    if (!label || !fullAddress || !city || !pincode) {
      return customerApiResponse.badRequest('Label, address, city, and pincode are required');
    }

    // Check if this is the first address (always make it default)
    const existingCount = await prisma.customerAddress.count({
      where: { customerId: customer.id },
    });

    const shouldBeDefault = isDefault || existingCount === 0;

    // If this is set as default, unset other defaults
    if (shouldBeDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        label: label.trim(),
        fullAddress: fullAddress.trim(),
        landmark: landmark?.trim() || null,
        city: city.trim(),
        pincode: pincode.trim(),
        latitude: latitude || null,
        longitude: longitude || null,
        isDefault: shouldBeDefault,
      },
    });

    // Sync default address to customer.address field
    await syncDefaultAddressToCustomer(customer.id);

    return customerApiResponse.success({ address }, 'Address added successfully');
  } catch (error) {
    console.error('Create address error:', error);
    return customerApiResponse.error('Failed to add address');
  }
}

export { syncDefaultAddressToCustomer };