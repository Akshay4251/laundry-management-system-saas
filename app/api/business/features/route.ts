// app/api/business/features/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export interface BusinessFeatures {
  // Core Features
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  workshopEnabled: boolean;
  multiStoreEnabled: boolean;
  
  // GST Settings
  gstEnabled: boolean;
  gstPercentage: number;
  gstNumber: string | null;
  
  // Limits
  maxStores: number;
  maxStaff: number;
  maxMonthlyOrders: number;
  
  // Additional Features
  smsNotifications: boolean;
  emailNotifications: boolean;
  whatsappIntegration: boolean;
  advancedReports: boolean;
  expressMultiplier: number;
  
  // Plan Info
  planType: string;
  planStatus: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return apiResponse.notFound('Business not found');
    }

    const [business, settings] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          planType: true,
          planStatus: true,
          gstNumber: true,
        },
      }),
      prisma.businessSettings.findUnique({
        where: { businessId },
      }),
    ]);

    if (!business) {
      return apiResponse.notFound('Business not found');
    }

    const planType = business.planType;
    const planStatus = business.planStatus;
    const isActive = ['ACTIVE', 'TRIAL'].includes(planStatus);
    const planDefaults = getPlanDefaults(planType);

    const features: BusinessFeatures = {
      // Core features
      pickupEnabled: isActive && (settings?.pickupEnabled ?? planDefaults.pickupEnabled),
      deliveryEnabled: isActive && (settings?.deliveryEnabled ?? planDefaults.deliveryEnabled),
      workshopEnabled: isActive && (settings?.workshopEnabled ?? planDefaults.workshopEnabled),
      multiStoreEnabled: isActive && (settings?.multiStoreEnabled ?? planDefaults.multiStoreEnabled),
      
      // GST Settings
      gstEnabled: settings?.gstEnabled ?? false,
      gstPercentage: settings?.gstPercentage 
        ? parseFloat(settings.gstPercentage.toString()) 
        : 18,
      gstNumber: business.gstNumber || null,
      
      // Limits
      maxStores: settings?.maxStores ?? planDefaults.maxStores,
      maxStaff: settings?.maxStaff ?? planDefaults.maxStaff,
      maxMonthlyOrders: settings?.maxMonthlyOrders ?? planDefaults.maxMonthlyOrders,
      
      // Additional features
      smsNotifications: isActive && (settings?.smsNotifications ?? planDefaults.smsNotifications),
      emailNotifications: isActive && (settings?.emailNotifications ?? planDefaults.emailNotifications),
      whatsappIntegration: isActive && (settings?.whatsappIntegration ?? planDefaults.whatsappIntegration),
      advancedReports: isActive && (settings?.advancedReports ?? planDefaults.advancedReports),
      expressMultiplier: settings?.expressMultiplier 
        ? parseFloat(settings.expressMultiplier.toString()) 
        : planDefaults.expressMultiplier,
      
      // Plan info
      planType,
      planStatus,
    };

    return apiResponse.success(features);
  } catch (error) {
    console.error('Error fetching business features:', error);
    return apiResponse.error('Failed to fetch business features');
  }
}

function getPlanDefaults(planType: string): BusinessFeatures {
  // ... same as before, just add GST defaults
  return {
    pickupEnabled: true,
    deliveryEnabled: true,
    workshopEnabled: false,
    multiStoreEnabled: false,
    gstEnabled: false,
    gstPercentage: 18,
    gstNumber: null,
    maxStores: 1,
    maxStaff: 5,
    maxMonthlyOrders: 100,
    smsNotifications: false,
    emailNotifications: true,
    whatsappIntegration: false,
    advancedReports: false,
    expressMultiplier: 1.5,
    planType: planType,
    planStatus: 'ACTIVE',
  };
}