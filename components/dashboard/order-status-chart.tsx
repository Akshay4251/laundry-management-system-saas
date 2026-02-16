// components/dashboard/order-status-chart.tsx

'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { OrderStatusDistribution } from '@/app/types/dashboard';

interface OrderStatusChartProps {
  data?: OrderStatusDistribution[];
}

// Transform data to recharts-compatible format with index signature
interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  status: string;
  percentage: number;
  label: string;
  [key: string]: string | number; // Add index signature for recharts compatibility
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  // Filter out statuses with 0 count and transform to chart-compatible format
  const chartData = useMemo((): ChartDataItem[] => {
    if (!data || data.length === 0) {
      return [];
    }
    return data
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: item.label,
        value: item.count,
        color: item.color,
        status: item.status,
        percentage: item.percentage,
        label: item.label,
      }));
  }, [data]);

  const totalOrders = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="h-70 sm:h-80 flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="text-center">
          <p className="text-slate-500 text-sm">No order data available</p>
          <p className="text-slate-400 text-xs mt-1">Data will appear once you have orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                `${value} orders (${totalOrders > 0 ? Math.round((value / totalOrders) * 100) : 0}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalOrders}</p>
            <p className="text-[10px] sm:text-xs text-slate-500">Total</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 sm:space-y-2">
        {chartData.map((item) => (
          <div key={item.status} className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{item.value}</span>
              <span className="text-slate-400 text-[10px] sm:text-xs">
                ({item.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}