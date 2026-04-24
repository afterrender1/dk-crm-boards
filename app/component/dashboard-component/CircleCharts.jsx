"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { inter } from '@/app/fonts';

// Theme-aligned colors
const COLORS = [
  '#57CAD9', // Active (Signature Cyan)
  '#F59E0B', // Pending (Amber)
  '#F43F5E', // Closed (Rose)
  '#94A3B8'  // Others (Slate)
];

export default function CircleCharts() {
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientStats = async () => {
      try {
        const response = await fetch('/api/client');
        const data = await response.json();
        const finalData = Array.isArray(data) ? data : data.data || [];
        setClientsData(finalData);
      } catch (error) {
        console.error('Error fetching circle chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientStats();
  }, []);

  // Process real data for the Pie Chart
  const statusDistribution = useMemo(() => {
    if (clientsData.length === 0) return [];

    const counts = {
      Active: clientsData.filter(c => c.status === 'Active').length,
      Pending: clientsData.filter(c => c.status === 'Pending').length,
      Closed: clientsData.filter(c => c.status === 'Closed').length,
    };

    return [
      { name: 'Active', value: counts.Active },
      { name: 'Pending', value: counts.Pending },
      { name: 'Closed', value: counts.Closed },
    ];
  }, [clientsData]);

  if (loading) {
    return (
      <div className="w-full h-80 sm:h-90 md:h-100 bg-white p-3 sm:p-4 md:p-6 rounded-xl border border-gray-100 flex items-center justify-center animate-pulse">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Loading Distribution...</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-80 sm:h-90 md:h-96 bg-white p-3 sm:p-4 md:p-6 rounded-xl border border-gray-100  ${inter.className}`}>
      <div className="mb-3 sm:mb-4 md:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight">Lead Distribution</h3>
        <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Real-time status breakdown</p>
      </div>

      <div className="relative h-[78%] sm:h-[80%]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={4}
              stroke="none"
              cornerRadius={5}
            >
              {statusDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{clientsData.length}</span>
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Leads</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4 mt-2">
        {statusDistribution.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}