// lib/notifications/create-notification.ts

import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  businessId: string;
  userId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

/**
 * Creates a notification and respects user preferences
 */
export async function createNotification({
  businessId,
  userId,
  type,
  title,
  message,
  data,
}: CreateNotificationParams) {
  try {
    // If userId provided, check their preferences
    if (userId) {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });

      const shouldNotify = checkIfNotificationEnabled(type, preferences);
      
      if (!shouldNotify) {
        console.log(`Notification skipped: User ${userId} has disabled ${type}`);
        return null;
      }
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        businessId,
        userId: userId || null,
        type,
        title,
        message,
        data: data || null,
      },
    });

    console.log(`✅ Notification created: [${type}] ${title}`);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * Create notification for all users in a business (business-wide)
 */
export async function createNotificationForBusiness({
  businessId,
  type,
  title,
  message,
  data,
}: Omit<CreateNotificationParams, 'userId'>) {
  try {
    // Create a business-wide notification (userId = null means all users see it)
    const notification = await prisma.notification.create({
      data: {
        businessId,
        userId: null,
        type,
        title,
        message,
        data: data || null,
      },
    });

    console.log(`✅ Business notification created: [${type}] ${title}`);
    return notification;
  } catch (error) {
    console.error('Failed to create business notification:', error);
    return null;
  }
}

/**
 * Check if notification type is enabled in user preferences
 */
function checkIfNotificationEnabled(
  type: NotificationType,
  preferences: any
): boolean {
  if (!preferences) {
    return true; // Default: all enabled
  }

  // Map notification types to preference keys
  const notificationMap: Record<string, string> = {
    // Order notifications
    ORDER_CREATED: 'notifyNewOrders',
    ORDER_COMPLETED: 'notifyOrderComplete',
    ORDER_READY: 'notifyOrderComplete',
    ORDER_PICKED_UP: 'notifyOrderComplete',
    ORDER_DELIVERED: 'notifyOrderComplete',
    
    // Payment notifications
    PAYMENT_RECEIVED: 'notifyNewOrders',
    
    // Inventory notifications
    LOW_STOCK: 'notifyLowStock',
    
    // Customer notifications
    NEW_CUSTOMER: 'notifyNewOrders',
    CUSTOMER_CREATED: 'notifyNewOrders',
    
    // Workshop notifications
    REWORK_REQUESTED: 'notifyOrderComplete',
    WORKSHOP_RETURNED: 'notifyOrderComplete',
    
    // System notifications
    SYSTEM: 'notifyMarketing',
    REMINDER: 'notifyMarketing',
  };

  const preferenceKey = notificationMap[type];
  
  if (!preferenceKey) {
    console.warn(`Unknown notification type: ${type}, defaulting to enabled`);
    return true;
  }
  
  return preferences[preferenceKey] ?? true;
}