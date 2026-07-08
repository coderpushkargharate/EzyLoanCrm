'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { GROUPS, groupStyle } from '@/lib/groups';
import { cn } from '@/lib/utils';
// hello
const STATUS_OPTIONS = [
  'New',
  'No Response',
  'Cold',
  'Warm',
  '1. Interested',
  '0. Not Interested',
  'Lost',
  'Converted',
  'Out Of Odisha',
];

const SOURCE_OPTIONS = [
  'Manual',
  'Website Form',
  'Facebook Lead',
  'Instagram',
  'Referral',
  'WhatsApp',
  'Other',
];

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function AddClientModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    phone: '',
    whatsapp: '',
    email: '',
    notes: '',
    status: 'New',
    source: 'Manual',
    followUpDate: '',
    groups: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleGroup(group: string) {
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.includes(group)
        ? prev.groups.filter((g) => g !== group)
        : [...prev.groups, group],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    setError('');

    const body: Record<string, unknown> = { ...form };
    if (!body.followUpDate) delete body.followUpDate;

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to save');
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add New Client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Client Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Katherine Lim"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Display Name
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => update('displayName', e.target.value)}
                placeholder="e.g. Katherine"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Display name is what your clients will see.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Mobile Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+91 08123 456 89"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => update('whatsapp', e.target.value)}
                placeholder="+91 08123 456 89"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="john@email.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
              >
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Source
              </label>
              <select
                value={form.source}
                onChange={(e) => update('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
              >
                {SOURCE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Follow Up Date
              </label>
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => update('followUpDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Add notes about this client..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Groups
              </label>
              <div className="flex flex-wrap gap-1.5">
                {GROUPS.map((g) => {
                  const active = form.groups.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGroup(g)}
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap border transition',
                        active
                          ? groupStyle(g) + ' border-transparent'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      )}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-teal-700 transition disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
