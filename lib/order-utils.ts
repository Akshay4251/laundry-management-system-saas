// lib/order-utils.ts

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Generates a unique order number with format: STORECODE-YYMMDD-NNNN
 *
 * IMPORTANT: Searches GLOBALLY (not per-business) because the
 * orderNumber column has a global @unique constraint in the schema.
 * Multiple businesses can share the same store code prefix (e.g., "MAI"
 * from "Main Store"), so we must check across all businesses.
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

  // ✅ FIX: Search GLOBALLY — orderNumber is @unique across ALL businesses
  // If we filter by businessId, we miss orders from other businesses
  // that share the same prefix, causing guaranteed collisions on retry
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: { startsWith: prefix },
    },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  });

  let nextSequence = 1;
  if (lastOrder) {
    // Extract sequence directly after prefix: "STR-250615-0042" → "0042"
    const sequencePart = lastOrder.orderNumber.substring(prefix.length);
    const lastSequence = parseInt(sequencePart, 10);
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
 * Detects any P2002 unique constraint violation during order creation.
 *
 * ✅ FIX: The old code checked for 'order_number' (DB column name),
 * but Prisma returns 'orderNumber' (model field name) in meta.target.
 * Now we simply catch ANY P2002 error during order creation, since the
 * only unique fields being inserted are orderNumber and tagNumber —
 * both of which are fixed by regenerating the order number.
 */
function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

/**
 * Wraps order creation with retry logic for unique constraint collisions.
 *
 * Handles race conditions when multiple sources create orders simultaneously:
 * - SaaS Dashboard (/api/orders)
 * - Customer App (/api/customer-app/orders)
 * - Reorder (/api/customer-app/orders/[id]/reorder)
 *
 * On each retry, generateOrderNumber is called fresh inside createFn,
 * so it sees any newly committed orders and picks the next sequence.
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
      if (isUniqueConstraintError(error)) {
        const meta =
          error instanceof Prisma.PrismaClientKnownRequestError
            ? JSON.stringify(error.meta)
            : 'unknown';
        console.warn(
          `[Order Creation] Unique constraint collision — attempt ${attempt + 1}/${maxRetries} — meta: ${meta}`
        );

        if (attempt === maxRetries - 1) {
          console.error(
            '[Order Creation] All retries exhausted. Possible causes: ' +
            '1) Extremely high concurrent volume, ' +
            '2) Stale data in orders table'
          );
          return {
            success: false,
            error:
              'Unable to create order due to high traffic. Please try again in a moment.',
          };
        }

        // Progressive delay: 100ms, 200ms, 300ms, 400ms
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * (attempt + 1))
        );
        continue;
      }

      // Non-P2002 errors — don't retry, throw immediately
      throw error;
    }
  }

  return {
    success: false,
    error: 'Failed to create order. Please try again.',
  };
}