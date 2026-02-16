// app/(dashboard)/orders/[id]/page.tsx
'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OrderHeader } from './components/order-header';
import { OrderItemsTable } from './components/order-items-table';
import { OrderTimeline } from './components/order-timeline';
import { OrderActions } from './components/order-actions';
import { OrderInfoCards } from './components/order-info-cards';
import { useOrder } from '@/app/hooks/use-orders';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' as const
    },
  },
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);

  const { data, isLoading, isError, error } = useOrder(id);
  const order = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Loading order...</p>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">!</span>
          </div>
          <h2 className="text-lg font-medium text-slate-900 mb-1">Failed to load order</h2>
          <p className="text-sm text-slate-500 mb-6">{error?.message || 'Something went wrong'}</p>
          <Link href="/orders">
            <Button variant="outline" size="sm" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Back Navigation - Full Width, Not Sticky */}
      <div className="bg-white border-b border-slate-200 rounded-2xl mt-4">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4">
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="h-9 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-6"
      >
        {/* Order Header */}
        <motion.div variants={itemVariants}>
          <OrderHeader order={order} />
        </motion.div>

        {/* Timeline & Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <OrderTimeline order={order} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <OrderActions order={order} />
          </motion.div>
        </div>

        {/* Items Table */}
        <motion.div variants={itemVariants}>
          <OrderItemsTable order={order} />
        </motion.div>

        {/* Info Cards */}
        <motion.div variants={itemVariants}>
          <OrderInfoCards order={order} />
        </motion.div>
      </motion.div>
    </div>
  );
}