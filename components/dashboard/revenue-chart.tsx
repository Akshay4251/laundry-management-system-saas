'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const weekData = [
  { name: 'Mon', revenue: 12000 },
  { name: 'Tue', revenue: 19000 },
  { name: 'Wed', revenue: 15000 },
  { name: 'Thu', revenue: 25000 },
  { name: 'Fri', revenue: 22000 },
  { name: 'Sat', revenue: 30000 },
  { name: 'Sun', revenue: 28000 },
];

const monthData = [
  { name: 'Week 1', revenue: 85000 },
  { name: 'Week 2', revenue: 92000 },
  { name: 'Week 3', revenue: 78000 },
  { name: 'Week 4', revenue: 105000 },
];

const yearData = [
  { name: 'Jan', revenue: 320000 },
  { name: 'Feb', revenue: 280000 },
  { name: 'Mar', revenue: 390000 },
  { name: 'Apr', revenue: 410000 },
  { name: 'May', revenue: 380000 },
  { name: 'Jun', revenue: 450000 },
  { name: 'Jul', revenue: 420000 },
  { name: 'Aug', revenue: 480000 },
  { name: 'Sep', revenue: 460000 },
  { name: 'Oct', revenue: 520000 },
  { name: 'Nov', revenue: 490000 },
  { name: 'Dec', revenue: 550000 },
];

interface RevenueChartProps {
  timeRange: 'week' | 'month' | 'year';
}

export function RevenueChart({ timeRange }: RevenueChartProps) {
  const data = timeRange === 'week' ? weekData : timeRange === 'month' ? monthData : yearData;

  return (
    <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          stroke="#64748b"
          fontSize={10}
          className="sm:text-xs"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#64748b"
          fontSize={10}
          className="sm:text-xs"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value / 1000}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '12px',
          }}
          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
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