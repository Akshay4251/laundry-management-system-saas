// app/hooks/use-subscription.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BusinessPlan, BillingCycle } from '@prisma/client';
import { 
  SubscriptionResponse, 
  CheckoutSession, 
  BillingHistoryResponse,
} from '@/app/types/subscription';

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchSubscription(): Promise<SubscriptionResponse> {
  const response = await fetch('/api/subscription');
  if (!response.ok) {
    if (response.status === 404) {
      return {
        hasSubscription: false,
        planType: 'TRIAL',
        planStatus: 'TRIAL',
        daysRemaining: 0,
      };
    }
    throw new Error('Failed to fetch subscription');
  }
  const result = await response.json();
  return result.data;
}

async function fetchBillingHistory(): Promise<BillingHistoryResponse> {
  const response = await fetch('/api/subscription/billing-history');
  if (!response.ok) throw new Error('Failed to fetch billing history');
  const result = await response.json();
  return result.data;
}

async function createPaymentOrder(data: { 
  planType: BusinessPlan; 
  billingCycle: BillingCycle 
}): Promise<CheckoutSession> {
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment order');
  }
  
  return (await response.json()).data;
}

async function verifyPayment(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  subscriptionId: string;
}): Promise<{ success: boolean; planType: string; validUntil: string }> {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Payment verification failed');
  }
  
  return (await response.json()).data;
}

async function cancelSubscription(reason?: string): Promise<void> {
  const response = await fetch('/api/subscription/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel subscription');
  }
}

// ============================================================================
// HOOKS
// ============================================================================

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBillingHistory() {
  return useQuery({
    queryKey: ['billingHistory'],
    queryFn: fetchBillingHistory,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: createPaymentOrder,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create payment order');
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: verifyPayment,
    onSuccess: () => {
      toast.success('Payment successful! Your plan has been activated.');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['businessFeatures'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Payment verification failed');
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast.success('Subscription cancelled');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['businessFeatures'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel subscription');
    },
  });
}

// ============================================================================
// RAZORPAY CHECKOUT HOOK
// ============================================================================

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpayCheckout() {
  const createOrder = useCreatePaymentOrder();
  const verifyPaymentMutation = useVerifyPayment();
  
  const initiateCheckout = async (
    planType: BusinessPlan, 
    billingCycle: BillingCycle
  ): Promise<{ success: boolean; planType: string; validUntil: string }> => {
    const orderData = await createOrder.mutateAsync({ planType, billingCycle });
    
    if (typeof window === 'undefined' || !window.Razorpay) {
      throw new Error('Payment gateway not loaded. Please refresh the page.');
    }
    
    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'LaundryPro',
        description: `${orderData.planType} Plan - ${orderData.billingCycle.replace('_', ' ')}`,
        order_id: orderData.orderId,
        prefill: {
          email: orderData.customerEmail,
        },
        theme: {
          color: '#2563EB',
          backdrop_color: 'rgba(0,0,0,0.5)',
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const result = await verifyPaymentMutation.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              subscriptionId: orderData.subscriptionId,
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled'));
          },
          confirm_close: true,
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        reject(new Error(response.error.description || 'Payment failed'));
      });
      razorpay.open();
    });
  };
  
  return {
    initiateCheckout,
    isLoading: createOrder.isPending || verifyPaymentMutation.isPending,
  };
}