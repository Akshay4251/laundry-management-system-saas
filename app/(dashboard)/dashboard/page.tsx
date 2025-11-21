'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  IndianRupee,
  Clock,
  Package,
  AlertCircle,
  Eye,
  Edit,
  Printer,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { OrderStatusChart } from '@/components/dashboard/order-status-chart';

// ... (Interfaces and Mock Data same as previous - StatCardData, RecentOrder, etc.)
// Keeping interfaces and data abbreviated for brevity as they don't change layout logic.
// Use the same data structure from previous response.

// ... (Stats Data & RecentOrders Data) ...
// START MOCK DATA (Paste your stats and recentOrders arrays here from previous chat)
// END MOCK DATA

interface StatCardData {
  title: string;
  value: string;
  change: number;
  icon: any;
  trend: 'up' | 'down';
  color: string;
}

const stats: StatCardData[] = [
  { title: 'Total Revenue', value: '₹1,24,560', change: 12.5, icon: IndianRupee, trend: 'up', color: 'blue' },
  { title: 'Total Orders', value: '1,245', change: 8.2, icon: ShoppingBag, trend: 'up', color: 'green' },
  { title: 'Active Customers', value: '856', change: -3.1, icon: Users, trend: 'down', color: 'purple' },
  { title: 'Pending Orders', value: '23', change: 15.3, icon: Clock, trend: 'up', color: 'orange' },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'Rajesh Kumar', items: 5, amount: 450, status: 'processing', date: '2024-01-15' },
  { id: 'ORD-002', customer: 'Priya Sharma', items: 8, amount: 680, status: 'ready', date: '2024-01-15' },
  { id: 'ORD-003', customer: 'Amit Patel', items: 3, amount: 320, status: 'pending', date: '2024-01-14' },
  { id: 'ORD-004', customer: 'Sneha Reddy', items: 12, amount: 1250, status: 'delivered', date: '2024-01-13' },
  { id: 'ORD-005', customer: 'Vikram Singh', items: 6, amount: 540, status: 'processing', date: '2024-01-14' },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  ready: { label: 'Ready', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-300' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-300' },
};

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="space-y-6">
      {/* Page Header - Responsive Text */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid - Responsive Cols (1 -> 2 -> 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* ✅ Explicit bg-white */}
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <StatCardContent {...stat} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row - Responsive Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* ✅ Explicit bg-white */}
          <Card className="bg-white border-slate-200 shadow-sm h-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Track your revenue performance</CardDescription>
                </div>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                  {(['week', 'month', 'year'] as const).map((range) => (
                    <Button
                      key={range}
                      variant="ghost"
                      size="sm"
                      onClick={() => setTimeRange(range)}
                      className={cn(
                        'h-7 text-xs font-medium rounded-md transition-all',
                        timeRange === range ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart timeRange={timeRange} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Status Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* ✅ Explicit bg-white */}
          <Card className="bg-white border-slate-200 shadow-sm h-full">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current order distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderStatusChart />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* ✅ Explicit bg-white */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription className="hidden sm:block">Latest bookings and their status</CardDescription>
            </div>
            <Link href="/dashboard/bookings">
              <Button variant="outline" size="sm" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Responsive Table Container */}
            <div className="rounded-lg border border-slate-200 overflow-x-auto">
              <Table className="min-w-[800px] lg:min-w-full">
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-blue-600">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>{order.items}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">₹{order.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('font-medium', statusConfig[order.status as keyof typeof statusConfig].color)}
                        >
                          {statusConfig[order.status as keyof typeof statusConfig].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(order.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-green-600 hover:bg-green-50">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
      >
        <QuickActionCard
          title="Today's Pickups"
          count={12}
          icon={TrendingUp}
          color="blue"
          href="/dashboard/bookings/today-pickup"
        />
        <QuickActionCard
          title="Today's Deliveries"
          count={8}
          icon={TrendingDown}
          color="green"
          href="/dashboard/bookings/today-delivery"
        />
        <QuickActionCard
          title="Pending Actions"
          count={5}
          icon={AlertCircle}
          color="orange"
          href="/dashboard/bookings?status=pending"
        />
      </motion.div>
    </div>
  );
}

// Helper Component for Stat Content to keep code clean
function StatCardContent({ title, value, change, icon: Icon, trend, color }: StatCardData) {
  const colorConfig = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-100' },
  };
  const config = colorConfig[color as keyof typeof colorConfig];

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <div className="flex items-center gap-1 mt-2">
          {trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
          <span className={cn('text-sm font-medium', trend === 'up' ? 'text-green-600' : 'text-red-600')}>
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-slate-500 ml-1">vs last month</span>
        </div>
      </div>
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border', config.bg, config.border)}>
        <Icon className={cn('w-6 h-6', config.icon)} />
      </div>
    </div>
  );
}

function QuickActionCard({ title, count, icon: Icon, color, href }: { title: string; count: number; icon: any; color: string; href: string }) {
  const colorConfig = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
  };

  return (
    <Link href={href}>
      {/* ✅ Explicit bg-white */}
      <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center transition-colors', colorConfig[color as keyof typeof colorConfig])}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-medium text-slate-600 mb-1">{title}</h4>
          <p className="text-3xl font-bold text-slate-900">{count}</p>
        </CardContent>
      </Card>
    </Link>
  );
}