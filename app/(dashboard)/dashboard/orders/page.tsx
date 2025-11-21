'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, TrendingUp, Clock, CheckCircle, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderFilters } from './components/order-filters';
import { OrdersTable } from './components/orders-table';
import { OrderStatus, Order } from '@/app/types/order';
import Link from 'next/link';
import { motion } from 'framer-motion';

// ✅ FIX: Use static date strings that convert to Date on client-side only
const MOCK_ORDERS_DATA = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      address: '123 MG Road, Bangalore, Karnataka 560001',
    },
    items: 5,
    totalAmount: 1250,
    paidAmount: 1250,
    status: 'completed' as OrderStatus,
    orderDate: '2024-01-15T10:30:00',
    deliveryDate: '2024-01-17T18:00:00',
    paymentMode: 'upi' as const,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: {
      name: 'Priya Sharma',
      phone: '+91 98765 43211',
      address: '456 Koramangala, Bangalore, Karnataka 560034',
    },
    items: 8,
    totalAmount: 2100,
    paidAmount: 1000,
    status: 'processing' as OrderStatus,
    orderDate: '2024-01-16T09:15:00',
    deliveryDate: '2024-01-18T17:00:00',
    paymentMode: 'cash' as const,
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: {
      name: 'Amit Patel',
      phone: '+91 98765 43212',
      address: '789 Indiranagar, Bangalore, Karnataka 560038',
    },
    items: 3,
    totalAmount: 850,
    paidAmount: 0,
    status: 'pending' as OrderStatus,
    orderDate: '2024-01-16T11:45:00',
    deliveryDate: '2024-01-19T16:00:00',
    paymentMode: 'online' as const,
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customer: {
      name: 'Sneha Reddy',
      phone: '+91 98765 43213',
      address: '321 Whitefield, Bangalore, Karnataka 560066',
    },
    items: 12,
    totalAmount: 3500,
    paidAmount: 3500,
    status: 'ready' as OrderStatus,
    orderDate: '2024-01-15T14:20:00',
    deliveryDate: '2024-01-17T15:00:00',
    paymentMode: 'card' as const,
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customer: {
      name: 'Vikram Singh',
      phone: '+91 98765 43214',
      address: '654 HSR Layout, Bangalore, Karnataka 560102',
    },
    items: 6,
    totalAmount: 1800,
    paidAmount: 1800,
    status: 'delivery' as OrderStatus,
    orderDate: '2024-01-16T08:00:00',
    deliveryDate: '2024-01-17T20:00:00',
    paymentMode: 'upi' as const,
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    customer: {
      name: 'Ananya Iyer',
      phone: '+91 98765 43215',
      address: '987 Jayanagar, Bangalore, Karnataka 560041',
    },
    items: 4,
    totalAmount: 1100,
    paidAmount: 1100,
    status: 'pickup' as OrderStatus,
    orderDate: '2024-01-15T16:30:00',
    deliveryDate: '2024-01-17T12:00:00',
    paymentMode: 'cash' as const,
  },
];

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const urlStatus = searchParams.get('status') as OrderStatus | null;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(urlStatus || 'all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // ✅ Convert string dates to Date objects on client-side only
  const MOCK_ORDERS: Order[] = useMemo(() => 
    MOCK_ORDERS_DATA.map(order => ({
      ...order,
      orderDate: new Date(order.orderDate),
      deliveryDate: new Date(order.deliveryDate),
    })),
    []
  );

  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter((order) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.phone.includes(query);
        if (!matchesSearch) return false;
      }

      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      if (dateRange.from && order.orderDate < dateRange.from) {
        return false;
      }
      if (dateRange.to && order.orderDate > dateRange.to) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, dateRange, MOCK_ORDERS]);

  const stats = useMemo(() => {
    const filtered = statusFilter === 'all' ? MOCK_ORDERS : filteredOrders;
    return {
      totalOrders: filtered.length,
      totalRevenue: filtered.reduce((sum, order) => sum + order.totalAmount, 0),
      pendingOrders: filtered.filter((o) => o.status === 'pending').length,
      completedOrders: filtered.filter((o) => o.status === 'completed').length,
    };
  }, [statusFilter, filteredOrders, MOCK_ORDERS]);

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateRange({ from: undefined, to: undefined });
    router.push('/dashboard/orders');
  };

  const handleExport = () => {
    console.log('Exporting orders...', filteredOrders);
    alert('Export functionality will be implemented');
  };

  const handleRefresh = () => {
    console.log('Refreshing orders...');
    alert('Orders refreshed');
  };

  const handleView = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleEdit = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}/edit`);
  };

  const handleDelete = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      console.log('Deleting order:', orderId);
      alert('Delete functionality will be implemented');
    }
  };

  return (
    <div className="space-y-5">
      {/* ✨ Improved Header - Lighter, More Professional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <Link href="/dashboard/create-order">
          <Button size="default" className="gap-2 w-full sm:w-auto shadow-sm">
            <Plus className="w-4 h-4" />
            New Order
          </Button>
        </Link>
      </div>

      {/* ✨ Improved Stats Cards - Lighter, More Breathing Room */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl border border-blue-100/50 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.totalOrders}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl border border-emerald-100/50 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Revenue
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-2 flex items-center gap-1">
                <IndianRupee className="w-6 h-6 flex-shrink-0" />
                <span className="truncate">{stats.totalRevenue.toLocaleString('en-IN')}</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-white to-amber-50/30 rounded-xl border border-amber-100/50 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Pending
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.pendingOrders}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-green-50/30 rounded-xl border border-green-100/50 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.completedOrders}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ✨ Improved Filters - Cleaner Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm"
      >
        <OrderFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onReset={handleReset}
          onExport={handleExport}
          onRefresh={handleRefresh}
        />
      </motion.div>

      {/* ✨ Improved Table - Better Spacing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <OrdersTable
          orders={filteredOrders}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </motion.div>

      {/* Results Info */}
      {filteredOrders.length > 0 && (
        <div className="flex items-center justify-center text-sm text-slate-500 py-2">
          <p>
            Showing <span className="font-semibold text-slate-700">{filteredOrders.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{MOCK_ORDERS.length}</span> orders
          </p>
        </div>
      )}
    </div>
  );
}