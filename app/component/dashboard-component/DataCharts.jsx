"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { inter } from '@/app/fonts';

const data = [
  { name: 'Jan', uv: 4000, pv: 2400 },
  { name: 'Feb', uv: 3000, pv: 1398 },
  { name: 'Mar', uv: 2000, pv: 9800 },
  { name: 'Apr', uv: 2780, pv: 3908 },
  { name: 'May', uv: 1890, pv: 4800 },
  { name: 'Jun', uv: 2390, pv: 3800 },
  { name: 'Jul', uv: 3490, pv: 4300 },
];

export default function DataCharts() {
  return (
    <div className={`h-[320px] sm:h-[360px] md:h-96 bg-white p-3 sm:p-4 md:p-6 rounded-xl border border-gray-100 ${inter.className}`}>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">Revenue Overview</h3>

      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={data} margin={{ top: 5, right: 8, left: -24, bottom: 4 }}>
          {/* Grid Lines - Tailwind Gray 100 */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />

          {/* Axes - Tailwind Gray 400 */}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />

          {/* Custom Tooltip - Tailwind Styled */}
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              padding: '10px'
            }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          />

          <Legend iconType="circle" wrapperStyle={{ paddingTop: '12px', fontSize: '11px', fontWeight: '600' }} />

          {/* Line 1 - Tailwind Blue 500 */}
          <Line
            type="monotone"
            dataKey="pv"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />

          {/* Line 2 - Tailwind Emerald 500 */}
          <Line
            type="monotone"
            dataKey="uv"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}