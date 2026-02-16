// components/dashboard/stat-cards.tsx

'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  trend: 'up' | 'down';
  index?: number;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend,
  index = 0,
  prefix = '',
  suffix = '',
  loading = false,
}: StatsCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;
  
  const iconColors = [
    { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
    { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
    { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-100' },
  ];
  
  const color = iconColors[index % iconColors.length];

  if (loading) {
    return (
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="w-24 h-4 bg-slate-100 rounded animate-pulse" />
              <div className="w-32 h-8 bg-slate-100 rounded animate-pulse" />
              <div className="w-28 h-4 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format value if it's a number
  const displayValue = typeof value === 'number' 
    ? value.toLocaleString('en-IN')
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600">
                {title}
              </p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">
                {prefix}{displayValue}{suffix}
              </p>
              <div className="flex items-center gap-1 mt-3">
                <TrendIcon
                  className={cn(
                    'w-4 h-4',
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change}%
                </span>
                <span className="text-sm text-slate-500">vs last period</span>
              </div>
            </div>
            <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center border', color.bg, color.border)}>
              <Icon className={cn('w-6 h-6', color.icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Grid wrapper for stats cards
interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6', className)}>
      {children}
    </div>
  );
}