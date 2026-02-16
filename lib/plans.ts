// lib/plans.ts

import { BusinessPlan, BillingCycle } from '@prisma/client';

// ============================================================================
// PLAN PRICING
// ============================================================================

export interface PlanPricing {
  monthly: number;
  semiAnnual: number;
  annual: number;
}

export interface PlanConfig {
  id: BusinessPlan;
  name: string;
  description: string;
  pricing: PlanPricing | null; // null for Enterprise (custom pricing)
  features: PlanFeatures;
  limits: PlanLimits;
  popular?: boolean;
}

export interface PlanFeatures {
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  workshopEnabled: boolean;
  multiStoreEnabled: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  whatsappIntegration: boolean;
  advancedReports: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  dedicatedManager: boolean;
}

export interface PlanLimits {
  maxStores: number;
  maxStaff: number;
  maxMonthlyOrders: number;
}

// ============================================================================
// PLAN DEFINITIONS
// ============================================================================

export const PLANS: Record<BusinessPlan, PlanConfig> = {
  TRIAL: {
    id: 'TRIAL',
    name: 'Trial',
    description: 'Try all features free for 14 days',
    pricing: null, // Free
    features: {
      pickupEnabled: true,
      deliveryEnabled: true,
      workshopEnabled: true,
      multiStoreEnabled: false,
      smsNotifications: false,
      emailNotifications: true,
      whatsappIntegration: false,
      advancedReports: true,
      prioritySupport: false,
      apiAccess: false,
      customBranding: false,
      dedicatedManager: false,
    },
    limits: {
      maxStores: 1,
      maxStaff: 3,
      maxMonthlyOrders: 50,
    },
  },
  BASIC: {
    id: 'BASIC',
    name: 'Basic',
    description: 'Perfect for small laundry shops',
    pricing: {
      monthly: 499,
      semiAnnual: 2700,  // ~₹450/month (10% savings)
      annual: 4999,      // ~₹417/month (17% savings)
    },
    features: {
      pickupEnabled: true,
      deliveryEnabled: true,
      workshopEnabled: false,
      multiStoreEnabled: false,
      smsNotifications: false,
      emailNotifications: true,
      whatsappIntegration: false,
      advancedReports: false,
      prioritySupport: false,
      apiAccess: false,
      customBranding: false,
      dedicatedManager: false,
    },
    limits: {
      maxStores: 1,
      maxStaff: 5,
      maxMonthlyOrders: 500,
    },
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Pro',
    description: 'For growing laundry businesses',
    pricing: {
      monthly: 1625,
      semiAnnual: 8750,  // ~₹1458/month (10% savings)
      annual: 17500,     // ~₹1458/month (10% savings)
    },
    popular: true,
    features: {
      pickupEnabled: true,
      deliveryEnabled: true,
      workshopEnabled: true,
      multiStoreEnabled: true,
      smsNotifications: true,
      emailNotifications: true,
      whatsappIntegration: true,
      advancedReports: true,
      prioritySupport: true,
      apiAccess: false,
      customBranding: true,
      dedicatedManager: false,
    },
    limits: {
      maxStores: 5,
      maxStaff: 20,
      maxMonthlyOrders: 2000,
    },
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'For large operations & chains',
    pricing: null, // Custom pricing
    features: {
      pickupEnabled: true,
      deliveryEnabled: true,
      workshopEnabled: true,
      multiStoreEnabled: true,
      smsNotifications: true,
      emailNotifications: true,
      whatsappIntegration: true,
      advancedReports: true,
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
      dedicatedManager: true,
    },
    limits: {
      maxStores: 999,
      maxStaff: 999,
      maxMonthlyOrders: 999999,
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPlanPrice(planType: BusinessPlan, billingCycle: BillingCycle): number {
  const plan = PLANS[planType];
  if (!plan.pricing) return 0; // Trial or Enterprise
  
  switch (billingCycle) {
    case 'MONTHLY':
      return plan.pricing.monthly;
    case 'SEMI_ANNUAL':
      return plan.pricing.semiAnnual;
    case 'ANNUAL':
      return plan.pricing.annual;
    default:
      return plan.pricing.monthly;
  }
}

export function getBillingCycleMonths(billingCycle: BillingCycle): number {
  switch (billingCycle) {
    case 'MONTHLY':
      return 1;
    case 'SEMI_ANNUAL':
      return 6;
    case 'ANNUAL':
      return 12;
    default:
      return 1;
  }
}

export function getMonthlyEquivalent(planType: BusinessPlan, billingCycle: BillingCycle): number {
  const totalPrice = getPlanPrice(planType, billingCycle);
  const months = getBillingCycleMonths(billingCycle);
  return Math.round(totalPrice / months);
}

export function getSavingsPercentage(planType: BusinessPlan, billingCycle: BillingCycle): number {
  const plan = PLANS[planType];
  if (!plan.pricing || billingCycle === 'MONTHLY') return 0;
  
  const monthlyTotal = plan.pricing.monthly * getBillingCycleMonths(billingCycle);
  const actualPrice = getPlanPrice(planType, billingCycle);
  const savings = ((monthlyTotal - actualPrice) / monthlyTotal) * 100;
  
  return Math.round(savings);
}

export function getTrialEndDate(startDate: Date = new Date()): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 14);
  return endDate;
}

export function isTrialExpired(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return true;
  return new Date() > new Date(trialEndsAt);
}

export function getDaysRemaining(endDate: Date): number {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getPlanFeatures(planType: BusinessPlan): PlanFeatures {
  return PLANS[planType].features;
}

export function getPlanLimits(planType: BusinessPlan): PlanLimits {
  return PLANS[planType].limits;
}

// Feature list for comparison table
export const FEATURE_LIST = [
  { key: 'maxMonthlyOrders', label: 'Monthly Orders', type: 'limit' },
  { key: 'maxStaff', label: 'Staff Accounts', type: 'limit' },
  { key: 'maxStores', label: 'Store Locations', type: 'limit' },
  { key: 'pickupEnabled', label: 'Pickup & Delivery', type: 'boolean' },
  { key: 'workshopEnabled', label: 'Workshop Management', type: 'boolean' },
  { key: 'multiStoreEnabled', label: 'Multi-Store Support', type: 'boolean' },
  { key: 'emailNotifications', label: 'Email Notifications', type: 'boolean' },
  { key: 'smsNotifications', label: 'SMS Notifications', type: 'boolean' },
  { key: 'whatsappIntegration', label: 'WhatsApp Integration', type: 'boolean' },
  { key: 'advancedReports', label: 'Advanced Reports', type: 'boolean' },
  { key: 'customBranding', label: 'Custom Branding', type: 'boolean' },
  { key: 'prioritySupport', label: 'Priority Support', type: 'boolean' },
  { key: 'apiAccess', label: 'API Access', type: 'boolean' },
  { key: 'dedicatedManager', label: 'Dedicated Account Manager', type: 'boolean' },
] as const;