// app/(dashboard)/dashboard/dashboard-client.tsx

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
  ArrowRight,
  Loader2,
  RefreshCcw,
  Truck,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useDashboardStats } from '@/app/hooks/use-dashboard';
import type { TimeRange, RecentOrder } from '@/app/types/dashboard';
import { ORDER_STATUS_CONFIG } from '@/app/types/order';

interface DashboardClientProps {
  session: any;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { data, isLoading, isError, refetch } = useDashboardStats(timeRange);

  const dashboardData = data?.data;
  const userName = session?.user?.name || 'there';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-slate-500 mb-4">
          There was an error loading your dashboard data.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 sm:pt-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Welcome back, {userName}!
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {dashboardData && (
          <>
            <StatCard
              title="Total Revenue"
              value={`₹${dashboardData.stats.revenue.total.toLocaleString(
                'en-IN'
              )}`}
              change={dashboardData.stats.revenue.change}
              trend={dashboardData.stats.revenue.trend}
              icon={IndianRupee}
              color="blue"
              index={0}
            />
            <StatCard
              title="Total Orders"
              value={dashboardData.stats.orders.total.toLocaleString()}
              change={dashboardData.stats.orders.change}
              trend={dashboardData.stats.orders.trend}
              icon={ShoppingBag}
              color="green"
              index={1}
            />
            <StatCard
              title="Active Customers"
              value={dashboardData.stats.customers.active.toLocaleString()}
              change={dashboardData.stats.customers.change}
              trend={dashboardData.stats.customers.trend}
              icon={Users}
              color="purple"
              index={2}
            />
            <StatCard
              title="Pending Orders"
              value={dashboardData.stats.pending.count.toLocaleString()}
              change={dashboardData.stats.pending.change}
              trend={dashboardData.stats.pending.trend}
              icon={Clock}
              color="orange"
              index={3}
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white border-slate-200 shadow-sm h-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>
                    Track your revenue performance
                  </CardDescription>
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
                        timeRange === range
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart
                data={dashboardData?.revenueChart || []}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white border-slate-200 shadow-sm h-full">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current order distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderStatusChart
                data={dashboardData?.statusDistribution || []}
              />
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
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription className="hidden sm:block">
                Latest bookings and their status
              </CardDescription>
            </div>
            <Link href="/orders">
              <Button variant="outline" size="sm" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable
              orders={dashboardData?.recentOrders || []}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
      >
        <QuickActionCard
          title="Today's Pickups"
          count={dashboardData?.quickStats.todayPickups || 0}
          icon={Truck}
          color="blue"
          href="/orders?status=PICKUP"
        />
        <QuickActionCard
          title="Today's Deliveries"
          count={dashboardData?.quickStats.todayDeliveries || 0}
          icon={Package}
          color="green"
          href="/orders?status=OUT_FOR_DELIVERY"
        />
        <QuickActionCard
          title="Pending Actions"
          count={dashboardData?.quickStats.pendingActions || 0}
          icon={AlertCircle}
          color="orange"
          href="/orders?status=IN_PROGRESS" // updated to in-progress
        />
      </motion.div>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
  index: number;
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  index,
}: StatCardProps) {
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-100',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-100',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-100',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      border: 'border-orange-100',
    },
  };
  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">
                {title}
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change}%
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  vs last period
                </span>
              </div>
            </div>
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center border',
                config.bg,
                config.border
              )}
            >
              <Icon className={cn('w-6 h-6', config.icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// RECENT ORDERS TABLE
// ============================================================================

function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No recent orders</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-x-auto">
      <Table className="min-w-[700px] lg:min-w-full">
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
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status];

            return (
              <TableRow key={order.id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-blue-600">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900">
                      {order.customer.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.customer.phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>{order.itemCount}</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-medium',
                      statusConfig.bgColor,
                      statusConfig.color,
                      statusConfig.borderColor
                    )}
                  >
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end">
                    <Link href={`/orders/${order.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================
// QUICK ACTION CARD
// ============================================================================

interface QuickActionCardProps {
  title: string;
  count: number;
  icon: any;
  color: 'blue' | 'green' | 'orange';
  href: string;
}

function QuickActionCard({
  title,
  count,
  icon: Icon,
  color,
  href,
}: QuickActionCardProps) {
  const colorConfig = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
  };

  return (
    <Link href={href}>
      <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                colorConfig[color]
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-medium text-slate-600 mb-1">
            {title}
          </h4>
          <p className="text-3xl font-bold text-slate-900">{count}</p>
        </CardContent>
      </Card>
    </Link>
  );
}