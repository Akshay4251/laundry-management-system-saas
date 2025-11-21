'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, MoreVertical, Edit, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Mock data - Replace with real API data later
const recentOrders = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    status: 'processing',
    amount: 45.0,
    date: '2024-01-15',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    status: 'ready',
    amount: 67.5,
    date: '2024-01-15',
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customerName: 'Mike Wilson',
    customerEmail: 'mike.w@email.com',
    status: 'pending',
    amount: 32.0,
    date: '2024-01-14',
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    customerName: 'Emily Brown',
    customerEmail: 'emily.b@email.com',
    status: 'delivered',
    amount: 89.0,
    date: '2024-01-14',
  },
  {
    id: '5',
    orderNumber: 'ORD-005',
    customerName: 'David Lee',
    customerEmail: 'david.l@email.com',
    status: 'processing',
    amount: 54.25,
    date: '2024-01-13',
  },
];

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ready: {
    label: 'Ready',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

export function RecentOrders() {
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
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm" className="gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="group flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all duration-200"
            >
              {/* Left Side */}
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="w-10 h-10 border border-slate-200">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.customerEmail}`}
                  />
                  <AvatarFallback className="bg-slate-100 text-slate-700 text-sm font-medium">
                    {order.customerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-sm text-slate-900">
                      {order.orderNumber}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-medium text-xs',
                        statusConfig[order.status as keyof typeof statusConfig]
                          .className
                      )}
                    >
                      {
                        statusConfig[order.status as keyof typeof statusConfig]
                          .label
                      }
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{order.customerName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{order.date}</p>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-4">
                <p className="text-lg font-semibold text-slate-900">
                  ${order.amount.toFixed(2)}
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
                        href={`/dashboard/orders/${order.id}`}
                        className="cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Order
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}