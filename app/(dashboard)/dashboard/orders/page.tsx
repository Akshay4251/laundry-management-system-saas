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

// Mock Data
const MOCK_ORDERS: Order[] = [
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
    status: 'completed',
    orderDate: new Date('2024-01-15T10:30:00'),
    deliveryDate: new Date('2024-01-17T18:00:00'),
    paymentMode: 'upi',
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
    status: 'processing',
    orderDate: new Date('2024-01-16T09:15:00'),
    deliveryDate: new Date('2024-01-18T17:00:00'),
    paymentMode: 'cash',
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
    status: 'pending',
    orderDate: new Date('2024-01-16T11:45:00'),
    deliveryDate: new Date('2024-01-19T16:00:00'),
    paymentMode: 'online',
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
    status: 'ready',
    orderDate: new Date('2024-01-15T14:20:00'),
    deliveryDate: new Date('2024-01-17T15:00:00'),
    paymentMode: 'card',
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
    status: 'delivery',
    orderDate: new Date('2024-01-16T08:00:00'),
    deliveryDate: new Date('2024-01-17T20:00:00'),
    paymentMode: 'upi',
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
    status: 'pickup',
    orderDate: new Date('2024-01-15T16:30:00'),
    deliveryDate: new Date('2024-01-17T12:00:00'),
    paymentMode: 'cash',
  },
];

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get status from URL params
  const urlStatus = searchParams.get('status') as OrderStatus | null;
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(urlStatus || 'all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter((order) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.phone.includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (dateRange.from && order.orderDate < dateRange.from) {
        return false;
      }
      if (dateRange.to && order.orderDate > dateRange.to) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, dateRange]);

  // Stats
  const stats = useMemo(() => {
    const filtered = statusFilter === 'all' ? MOCK_ORDERS : filteredOrders;
    return {
      totalOrders: filtered.length,
      totalRevenue: filtered.reduce((sum, order) => sum + order.totalAmount, 0),
      pendingOrders: filtered.filter((o) => o.status === 'pending').length,
      completedOrders: filtered.filter((o) => o.status === 'completed').length,
    };
  }, [statusFilter, filteredOrders]);

  // Handlers
  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateRange({ from: undefined, to: undefined });
    router.push('/dashboard/orders');
  };

  const handleExport = () => {
    console.log('Exporting orders...', filteredOrders);
    // TODO: Implement CSV export
    alert('Export functionality will be implemented');
  };

  const handleRefresh = () => {
    console.log('Refreshing orders...');
    // TODO: Refetch from API
    alert('Orders refreshed');
  };

  const handleView = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleEdit = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}/edit`);
  };

  const handleDelete = (orderId: string) => {
    // TODO: Implement delete with confirmation
    if (confirm('Are you sure you want to delete this order?')) {
      console.log('Deleting order:', orderId);
      alert('Delete functionality will be implemented');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track all your laundry orders
          </p>
        </div>
        <Link href="/dashboard/create-order">
          <Button size="default" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Order
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-slate-200 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-slate-200 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                {stats.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-slate-200 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-slate-200 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.completedOrders}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-slate-200 p-5"
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

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
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
        <div className="flex items-center justify-between text-sm text-slate-500 px-2">
          <p>
            Showing <span className="font-semibold text-slate-700">{filteredOrders.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{MOCK_ORDERS.length}</span> orders
          </p>
          {/* TODO: Add pagination here */}
        </div>
      )}
    </div>
  );
}