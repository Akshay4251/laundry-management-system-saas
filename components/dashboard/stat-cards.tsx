'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
  index?: number;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend,
  index = 0 
}: StatsCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;
  
  const iconColors = [
    { bg: 'bg-blue-50', icon: 'text-blue-600' },
    { bg: 'bg-purple-50', icon: 'text-purple-600' },
    { bg: 'bg-orange-50', icon: 'text-orange-600' },
    { bg: 'bg-green-50', icon: 'text-green-600' },
  ];
  
  const color = iconColors[index % iconColors.length];

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
                {value}
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
                  {change}
                </span>
                <span className="text-sm text-slate-500">from last month</span>
              </div>
            </div>
            <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', color.bg)}>
              <Icon className={cn('w-6 h-6', color.icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}