// components/dashboard/recent-orders.tsx

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, MoreVertical, ArrowRight, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_CONFIG, type OrderStatus } from '@/app/types/order';
import type { RecentOrder } from '@/app/types/dashboard';

interface RecentOrdersProps {
  orders?: RecentOrder[];
  isLoading?: boolean;
}

// Helper to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const orderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (orderDate.getTime() === today.getTime()) {
    return `Today, ${date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else if (orderDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function RecentOrders({ orders = [], isLoading = false }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <Card className="bg-white border border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Recent Orders
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Latest orders from your customers
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Recent Orders
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Latest orders from your customers
          </p>
        </div>
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No recent orders</p>
            <p className="text-slate-400 text-xs mt-1">Orders will appear here once created</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.status];
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="group flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                >
                  {/* Left Side */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="w-10 h-10 border border-slate-200 shrink-0">
                      <AvatarFallback className="bg-slate-100 text-slate-700 text-sm font-medium">
                        {getInitials(order.customer.fullName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-semibold text-sm text-slate-900">
                          {order.orderNumber}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-medium text-xs',
                            statusConfig.bgColor,
                            statusConfig.color,
                            statusConfig.borderColor
                          )}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{order.customer.fullName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                        <span className="text-slate-300">•</span>
                        <p className="text-xs text-slate-500">{order.itemCount} items</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-4 shrink-0">
                    <p className="text-lg font-semibold text-slate-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </p>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/orders/${order.id}`}
                            className="cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}