// lib/expo-push.ts

import { prisma } from './prisma';

interface ExpoPushMessage {
  to: string;
  sound?: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

/**
 * Send push notification to a customer
 */
export async function sendPushNotificationToCustomer(
  customerId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { expoPushToken: true, pushEnabled: true },
    });

    if (!customer?.expoPushToken || !customer.pushEnabled) {
      return false;
    }

    return sendExpoPushNotification({
      to: customer.expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    });
  } catch (error) {
    console.error('Send push notification error:', error);
    return false;
  }
}

/**
 * Send Expo push notification
 */
export async function sendExpoPushNotification(message: ExpoPushMessage): Promise<boolean> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json() as { data: ExpoPushTicket };

    if (result.data?.status === 'error') {
      console.error('Expo push error:', result.data.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Expo push request error:', error);
    return false;
  }
}

/**
 * Send push notification to multiple customers
 */
export async function sendPushNotificationToCustomers(
  customerIds: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<{ success: number; failed: number }> {
  const customers = await prisma.customer.findMany({
    where: {
      id: { in: customerIds },
      expoPushToken: { not: null },
      pushEnabled: true,
    },
    select: { expoPushToken: true },
  });

  const messages: ExpoPushMessage[] = customers
    .filter((c) => c.expoPushToken)
    .map((c) => ({
      to: c.expoPushToken!,
      sound: 'default' as const,
      title,
      body,
      data,
    }));

  if (messages.length === 0) {
    return { success: 0, failed: customerIds.length };
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json() as { data: ExpoPushTicket[] };

    const success = result.data.filter((t) => t.status === 'ok').length;
    const failed = result.data.filter((t) => t.status === 'error').length;

    return { success, failed };
  } catch (error) {
    console.error('Bulk push notification error:', error);
    return { success: 0, failed: messages.length };
  }
}