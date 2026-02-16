// components/dashboard/revenue-chart.tsx

'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RevenueDataPoint, TimeRange } from '@/app/types/dashboard';

interface RevenueChartProps {
  data?: RevenueDataPoint[];
  timeRange: TimeRange;
}

export function RevenueChart({ data, timeRange }: RevenueChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Transform data for the chart
    return data.map((item) => ({
      name: item.label,
      revenue: item.revenue,
      orders: item.orders,
    }));
  }, [data]);

  const formatYAxis = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}k`;
    }
    return `₹${value}`;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[250px] sm:h-[300px] flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="text-center">
          <p className="text-slate-500 text-sm">No revenue data available</p>
          <p className="text-slate-400 text-xs mt-1">Data will appear once you have orders</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#64748b"
          fontSize={10}
          className="sm:text-xs"
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="#64748b"
          fontSize={10}
          className="sm:text-xs"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatYAxis}
          dx={-5}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '12px',
          }}
          formatter={(value: number, name: string) => [
            `₹${value.toLocaleString('en-IN')}`,
            name === 'revenue' ? 'Revenue' : 'Orders',
          ]}
          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}