// app/api/super-admin/businesses/[id]/plan/route.ts

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isSuperAdmin) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    const { planType, planStatus } = await req.json();

    console.log('Updating plan for business:', id, { planType, planStatus });

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      return apiResponse.notFound('Business not found');
    }

    // Update plan
    const updated = await prisma.business.update({
      where: { id },
      data: {
        ...(planType && { planType }),
        ...(planStatus && { planStatus }),
      },
    });

    // Update settings based on plan if plan type changed
    if (planType && planType !== business.planType) {
      const planDefaults = getPlanDefaults(planType);
      await prisma.businessSettings.upsert({
        where: { businessId: id },
        update: planDefaults,
        create: {
          businessId: id,
          ...planDefaults,
        },
      });
    }

    console.log('Updated business:', updated);

    return apiResponse.success(updated, 'Plan updated successfully');
  } catch (error) {
    console.error('Error updating plan:', error);
    return apiResponse.error('Failed to update plan');
  }
}

function getPlanDefaults(planType: string) {
  switch (planType) {
    case 'ENTERPRISE':
      return {
        maxStores: 999,
        maxStaff: 999,
        maxMonthlyOrders: 999999,
        multiStoreEnabled: true,
        workshopEnabled: true,
        advancedReports: true,
        smsNotifications: true,
        whatsappIntegration: true,
      };
    case 'PROFESSIONAL':
      return {
        maxStores: 5,
        maxStaff: 20,
        maxMonthlyOrders: 2000,
        multiStoreEnabled: true,
        workshopEnabled: true,
        advancedReports: true,
        smsNotifications: true,
        whatsappIntegration: false,
      };
    case 'BASIC':
      return {
        maxStores: 1,
        maxStaff: 5,
        maxMonthlyOrders: 500,
        multiStoreEnabled: false,
        workshopEnabled: false,
        advancedReports: false,
        smsNotifications: false,
        whatsappIntegration: false,
      };
    default: // TRIAL
      return {
        maxStores: 1,
        maxStaff: 3,
        maxMonthlyOrders: 100,
        multiStoreEnabled: false,
        workshopEnabled: true,
        advancedReports: false,
        smsNotifications: false,
        whatsappIntegration: false,
      };
  }
}