// lib/order-utils.ts

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Generates a unique order number with format: STORECODE-YYMMDD-NNNN
 * Uses findFirst with orderBy desc to get the actual highest sequence number.
 * 
 * Used by:
 * - /api/orders (SaaS dashboard)
 * - /api/customer-app/orders (Customer mobile app)
 * - /api/customer-app/orders/[id]/reorder (Reorder from mobile app)
 */
export async function generateOrderNumber(
  businessId: string,
  storeId: string
): Promise<string> {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { name: true },
  });

  const storeCode =
    store?.name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'STR';

  const prefix = `${storeCode}-${year}${month}${day}-`;

  // Find the highest existing order number with this prefix
  // This works across ALL sources (dashboard, customer app, reorder)
  // because they all write to the same orders table
  const lastOrder = await prisma.order.findFirst({
    where: {
      businessId,
      orderNumber: { startsWith: prefix },
    },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  });

  let nextSequence = 1;
  if (lastOrder) {
    const parts = lastOrder.orderNumber.split('-');
    const lastSequence = parseInt(parts[parts.length - 1] || '0', 10);
    if (!isNaN(lastSequence)) {
      nextSequence = lastSequence + 1;
    }
  }

  const sequenceNumber = nextSequence.toString().padStart(4, '0');
  return `${prefix}${sequenceNumber}`;
}

/**
 * Generates tag number for order items
 * Format: ORDER_NUMBER-NNN
 */
export function generateTagNumber(
  orderNumber: string,
  itemIndex: number
): string {
  const itemNumber = itemIndex.toString().padStart(3, '0');
  return `${orderNumber}-${itemNumber}`;
}

/**
 * Checks if a Prisma error is a duplicate order_number violation
 */
export function isDuplicateOrderNumberError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray(error.meta?.target) &&
    (error.meta.target as string[]).includes('order_number')
  );
}

/**
 * Wraps order creation with retry logic for order number collisions.
 * 
 * This handles the race condition where:
 * 1. Dashboard creates order → generates sequence 0005
 * 2. Customer app creates order at same time → also generates 0005
 * 3. One succeeds, one fails with P2002
 * 4. Failed one retries with fresh sequence → succeeds with 0006
 * 
 * @param createFn - Function that generates order number and creates the order
 * @param maxRetries - Maximum retry attempts (default: 5)
 * @returns The result of createFn on success, or null if all retries exhausted
 */
export async function createOrderWithRetry<T>(
  createFn: () => Promise<T>,
  maxRetries: number = 5
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await createFn();
      return { success: true, data: result };
    } catch (error) {
      if (isDuplicateOrderNumberError(error)) {
        console.warn(
          `Order number collision (attempt ${attempt + 1}/${maxRetries})`
        );
        if (attempt === maxRetries - 1) {
          console.error('Max retries reached for order number generation');
          return {
            success: false,
            error: 'Failed to generate unique order number. Please try again.',
          };
        }
        // Progressive delay to reduce collision chance
        await new Promise((resolve) =>
          setTimeout(resolve, 50 * (attempt + 1))
        );
        continue;
      }
      // Re-throw non-duplicate errors
      throw error;
    }
  }

  return {
    success: false,
    error: 'Failed to create order. Please try again.',
  };
}