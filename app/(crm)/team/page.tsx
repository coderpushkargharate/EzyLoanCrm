'use client';

import { useEffect, useState } from 'react';
import { Users, BarChart2, CheckCircle, Clock, Info } from 'lucide-react';

interface Stats {
  totalLeads: number;
  newLeads: number;
  coldLeads: number;
  interestedLeads: number;
  lostLeads: number;
  convertedLeads: number;
  totalActivities: number;
}

export default function TeamPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((data) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  const TABS = ['Team Dashboard', 'Team Members', 'Subteams', 'Lead Assignment'];

  const statCards = [
    {
      label: 'TEAM MEMBERS',
      value: '1',
      sub: 'Activated accounts',
      icon: <Users size={16} className="text-gray-400" />,
    },
    {
      label: 'ASSIGNED CLIENTS',
      value: loading ? '...' : String(stats?.totalLeads ?? 0),
      sub: `of ${stats?.totalLeads ?? 0} added`,
      icon: <BarChart2 size={16} className="text-gray-400" />,
    },
    {
      label: 'CONTACTED CLIENTS',
      value: loading ? '...' : String((stats?.totalLeads ?? 0) - (stats?.newLeads ?? 0)),
      sub: `${stats?.totalLeads ? Math.round((((stats.totalLeads - stats.newLeads) / stats.totalLeads) * 100)) : 0}% of clients assigned`,
      icon: <CheckCircle size={16} className="text-gray-400" />,
    },
    {
      label: 'AVERAGE RESPONSE TIME',
      value: '-',
      sub: 'for contacted clients',
      icon: <Clock size={16} className="text-gray-400" />,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-gray-100">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(t.toLowerCase().replace(' ', '_'))}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                (i === 0 && activeTab === 'dashboard') || activeTab === t.toLowerCase().replace(' ', '_')
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Filters row */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">
              <Users size={14} />
              All Groups
              <span className="text-gray-400">›</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">
              <Clock size={14} />
              Last 7 days
              <span className="text-gray-400">▾</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {card.label}
                  </span>
                  <Info size={14} className="text-gray-300" />
                </div>
                <p className="text-3xl font-bold text-cyan-600">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Team table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Team Member</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned Clients</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Contacted Clients</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Avg Response Time</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Total Activities</th>
                </tr>
              </thead>
              <tbody>
                {/* Total row */}
                <tr className="border-b border-gray-100 bg-gray-50/50 font-semibold">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">{stats?.totalLeads ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700 hidden md:table-cell">
                    {stats ? stats.totalLeads - stats.newLeads : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-400 hidden lg:table-cell">-</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700 hidden lg:table-cell">{stats?.totalActivities ?? '-'}</td>
                </tr>
                {/* Admin member */}
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 text-sm text-gray-400">1</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">Chandan Mohanty</p>
                    <p className="text-xs text-gray-400">dibyanshassociates@gmail.com</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-cyan-600 font-semibold">{stats?.totalLeads ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-center hidden md:table-cell">
                    <div>
                      <span className="text-gray-700">{stats ? stats.totalLeads - stats.newLeads : '-'}</span>
                      <p className="text-xs text-gray-400">
                        {stats?.totalLeads
                          ? `${Math.round((((stats.totalLeads - stats.newLeads) / stats.totalLeads) * 100))}% of assigned`
                          : '-'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-400 hidden lg:table-cell">-</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700 hidden lg:table-cell">{stats?.totalActivities ?? '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Info banner */}
          <div className="mt-4 p-4 bg-cyan-50 border border-cyan-100 rounded-xl">
            <p className="text-sm font-semibold text-cyan-700">Invite Team Members</p>
            <p className="text-xs text-cyan-600 mt-1">
              Using the Team Dashboard, you can track key metrics, gain insights, and boost productivity.
              Add more team members to collaborate on leads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
