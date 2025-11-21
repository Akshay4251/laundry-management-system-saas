'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Delivered', value: 450, color: '#10b981' },
  { name: 'Processing', value: 280, color: '#3b82f6' },
  { name: 'Ready', value: 150, color: '#8b5cf6' },
  { name: 'Pending', value: 120, color: '#f59e0b' },
  { name: 'Cancelled', value: 45, color: '#ef4444' },
];

export function OrderStatusChart() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
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
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-1.5 sm:space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600">{item.name}</span>
            </div>
            <span className="font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}