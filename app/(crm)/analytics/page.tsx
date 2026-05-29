'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, UserX, UserCheck, Target, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface AnalyticsData {
  stats: {
    totalLeads: number;
    newLeads: number;
    coldLeads: number;
    interestedLeads: number;
    lostLeads: number;
    convertedLeads: number;
    totalActivities: number;
  };
  monthlyLeads: Array<{ _id: { year: number; month: number }; count: number }>;
  statusBreakdown: Array<{ _id: string; count: number }>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS: Record<string, string> = {
  'New': '#0ea5e9',
  'No Response': '#f43f5e',
  'Cold': '#64748b',
  'Warm': '#f97316',
  '1. Interested': '#22c55e',
  '0. Not Interested': '#374151',
  'Lost': '#ef4444',
  'Converted': '#10b981',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = data?.monthlyLeads.map((d) => ({
    name: MONTHS[d._id.month - 1],
    leads: d.count,
  })) || [];

  const pieData = data?.statusBreakdown.map((d) => ({
    name: d._id,
    value: d.count,
    color: STATUS_COLORS[d._id] || '#94a3b8',
  })) || [];

  const statCards = data ? [
    { label: 'Total Leads', value: data.stats.totalLeads, icon: <Users size={20} />, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'New / Uncontacted', value: data.stats.newLeads, icon: <TrendingUp size={20} />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Interested', value: data.stats.interestedLeads, icon: <UserCheck size={20} />, color: 'text-green-600 bg-green-50' },
    { label: 'Converted', value: data.stats.convertedLeads, icon: <Target size={20} />, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Lost', value: data.stats.lostLeads, icon: <UserX size={20} />, color: 'text-red-600 bg-red-50' },
    { label: 'Total Activities', value: data.stats.totalActivities, icon: <Activity size={20} />, color: 'text-teal-600 bg-teal-50' },
  ] : [];

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const conversionRate = data?.stats.totalLeads
    ? Math.round((data.stats.convertedLeads / data.stats.totalLeads) * 100)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Track your sales pipeline performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${card.color}`}>{card.icon}</div>
              <span className="text-xs font-medium text-gray-500">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Conversion Rate */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl p-6 mb-6 text-white">
        <p className="text-cyan-100 text-sm font-medium mb-1">Conversion Rate</p>
        <p className="text-5xl font-bold">{conversionRate}%</p>
        <p className="text-cyan-100 text-sm mt-1">
          {data?.stats.convertedLeads} out of {data?.stats.totalLeads} leads converted
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Leads</h3>
          {monthlyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No data for the last 6 months
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="leads" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Lead Status Breakdown</h3>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No leads yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status table */}
      {data && data.statusBreakdown.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Status Summary</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Count</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.statusBreakdown.map((row) => (
                <tr key={row._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        background: STATUS_COLORS[row._id] + '20',
                        color: STATUS_COLORS[row._id] || '#64748b',
                      }}
                    >
                      {row._id}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{row.count}</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-500">
                    {data.stats.totalLeads ? Math.round((row.count / data.stats.totalLeads) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
