// lib/razorpay.ts

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { BillingCycle, BusinessPlan } from '@prisma/client';
import { getPlanPrice, getBillingCycleMonths } from './plans';

// ============================================================================
// RAZORPAY INSTANCE
// ============================================================================

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn('⚠️ Razorpay credentials not configured');
}

export const razorpay = new Razorpay({
  key_id: keyId || '',
  key_secret: keySecret || '',
});

// ============================================================================
// TYPES
// ============================================================================

export interface CreateOrderParams {
  planType: BusinessPlan;
  billingCycle: BillingCycle;
  businessId: string;
  businessName: string;
  customerEmail: string;
  customerPhone?: string;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  planType: BusinessPlan;
  billingCycle: BillingCycle;
  keyId: string;
  businessName: string;
  customerEmail: string;
}

export interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// ============================================================================
// ORDER FUNCTIONS
// ============================================================================

export async function createRazorpayOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const { planType, billingCycle, businessId, businessName, customerEmail } = params;
  
  const amount = getPlanPrice(planType, billingCycle);
  
  if (amount === 0) {
    throw new Error('Cannot create order for free plan');
  }
  
  const amountInPaise = Math.round(amount * 100);
  
  if (amountInPaise < 100) {
    throw new Error('Amount must be at least ₹1');
  }
  
  const receipt = `sub_${businessId.substring(0, 8)}_${Date.now()}`;
  
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes: {
      businessId,
      businessName,
      planType,
      billingCycle,
      customerEmail,
    },
  });
  
  return {
    orderId: order.id,
    amount,
    currency: 'INR',
    planType,
    billingCycle,
    keyId: process.env.RAZORPAY_KEY_ID || '',
    businessName,
    customerEmail,
  };
}

// ============================================================================
// VERIFICATION FUNCTIONS
// ============================================================================

export function verifyPaymentSignature(params: VerifyPaymentParams): boolean {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
  
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');
  
  return expectedSignature === razorpaySignature;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');
  
  return expectedSignature === signature;
}

// ============================================================================
// PAYMENT DETAILS
// ============================================================================

export async function getPaymentDetails(paymentId: string) {
  return await razorpay.payments.fetch(paymentId);
}

// ============================================================================
// REFUND
// ============================================================================

export async function createRefund(paymentId: string, amount?: number) {
  return await razorpay.payments.refund(paymentId, {
    ...(amount && { amount: amount * 100 }),
  });
}

// ============================================================================
// SUBSCRIPTION DATES
// ============================================================================

export function calculateSubscriptionDates(billingCycle: BillingCycle, startDate: Date = new Date()) {
  const months = getBillingCycleMonths(billingCycle);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  
  return { startDate, endDate };
}