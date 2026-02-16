// components/razorpay-script.tsx

'use client';

import Script from 'next/script';

export function RazorpayScript() {
  return (
    <Script
      id="razorpay-checkout"
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="lazyOnload"
    />
  );
}