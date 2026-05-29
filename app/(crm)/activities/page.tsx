'use client';

import { useEffect, useState } from 'react';
import { Phone, Mail, MessageSquare, RefreshCw, Star, Calendar, Plus } from 'lucide-react';
import StatusBadge from '@/components/crm/StatusBadge';

interface Activity {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
  leadId?: { _id: string; name: string; phone: string };
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  note: { icon: <MessageSquare size={14} />, color: 'bg-blue-100 text-blue-600', label: 'Note' },
  call: { icon: <Phone size={14} />, color: 'bg-green-100 text-green-600', label: 'Call' },
  email: { icon: <Mail size={14} />, color: 'bg-orange-100 text-orange-600', label: 'Email' },
  status_change: { icon: <RefreshCw size={14} />, color: 'bg-purple-100 text-purple-600', label: 'Status Changed' },
  created: { icon: <Plus size={14} />, color: 'bg-teal-100 text-teal-600', label: 'Lead Created' },
  follow_up: { icon: <Calendar size={14} />, color: 'bg-yellow-100 text-yellow-600', label: 'Follow Up' },
  meeting: { icon: <Star size={14} />, color: 'bg-pink-100 text-pink-600', label: 'Meeting' },
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/activities')
      .then((r) => r.json())
      .then((data) => {
        setActivities(data.activities || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total activities logged</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">No activities yet</p>
            <p className="text-gray-400 text-sm mt-1">Start adding clients and activities will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((a) => {
              const config = TYPE_CONFIG[a.type] || {
                icon: <MessageSquare size={14} />,
                color: 'bg-gray-100 text-gray-600',
                label: a.type,
              };
              return (
                <div key={a._id} className="flex gap-4 px-6 py-4 hover:bg-gray-50/50 transition">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {a.leadId && (
                          <p className="text-sm font-semibold text-gray-900">{a.leadId.name}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-0.5">{a.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(a.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
