// app/types/subscription.ts

import { BusinessPlan, BillingCycle, SubscriptionStatus, PaymentStatusType } from '@prisma/client';

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export interface Subscription {
  id: string;
  businessId: string;
  planType: BusinessPlan;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart: string | null;
  trialEnd: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  paymentMethod: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface SubscriptionWithPayments extends Subscription {
  payments: SubscriptionPayment[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SubscriptionResponse {
  hasSubscription: boolean;
  subscription?: {
    id: string;
    planType: BusinessPlan;
    billingCycle: BillingCycle;
    amount: number;
    currency: string;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelledAt: string | null;
    cancelReason: string | null;
    createdAt: string;
  };
  recentPayments?: {
    id: string;
    amount: number;
    status: PaymentStatusType;
    paymentMethod: string | null;
    paidAt: string | null;
    createdAt: string;
  }[];
  planType: BusinessPlan;
  planStatus: string;
  trialEndsAt?: string | null;
  isTrialExpired?: boolean;
  daysRemaining: number;
  isExpiringSoon?: boolean;
}

export interface BillingHistoryResponse {
  items: BillingHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// CHECKOUT TYPES
// ============================================================================

export interface CheckoutSession {
  orderId: string;
  amount: number;
  currency: string;
  planType: BusinessPlan;
  billingCycle: BillingCycle;
  keyId: string;
  businessName: string;
  customerEmail: string;
  subscriptionId: string;
}

export interface CheckoutFormData {
  planType: BusinessPlan;
  billingCycle: BillingCycle;
}

// ============================================================================
// BILLING HISTORY
// ============================================================================

export interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  paymentMethod: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
  razorpayPaymentId: string | null;
  invoiceUrl?: string;
}

// ============================================================================
// PLAN CHANGE
// ============================================================================

export interface PlanChangePreview {
  currentPlan: BusinessPlan;
  newPlan: BusinessPlan;
  billingCycle: BillingCycle;
  currentAmount: number;
  newAmount: number;
  prorationAmount: number;
  amountDue: number;
  effectiveDate: string;
}