'use client';

import { useState, useEffect } from 'react';
import { X, Phone, Mail, Trash2, Save, Calendar, Tag, MessageSquare } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { Lead } from '@/app/(crm)/clients/page';

const STATUS_OPTIONS = [
  'New', 'No Response', 'Cold', 'Warm',
  '1. Interested', '0. Not Interested', 'Lost', 'Converted',
];

interface Activity {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface Props {
  lead: Lead;
  onClose: () => void;
  onUpdated: (lead: Lead) => void;
  onDeleted: () => void;
}

export default function ClientDrawer({ lead, onClose, onUpdated, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...lead });
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    setForm({ ...lead });
    fetchActivities();
  }, [lead._id]);

  async function fetchActivities() {
    const res = await fetch(`/api/leads/${lead._id}`);
    if (res.ok) {
      const data = await res.json();
      setActivities(data.activities || []);
    }
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/leads/${lead._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      onUpdated(data.lead);
      setEditing(false);
      fetchActivities();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    await fetch(`/api/leads/${lead._id}`, { method: 'DELETE' });
    onDeleted();
  }

  async function addNote() {
    if (!newNote.trim()) return;
    setAddingNote(true);
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: lead._id, type: 'note', description: newNote }),
    });
    setNewNote('');
    fetchActivities();
    setAddingNote(false);
  }

  function formatDate(d?: string) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  const ACTIVITY_ICONS: Record<string, string> = {
    note: '📝', call: '📞', email: '📧', meeting: '🤝',
    status_change: '🔄', created: '✨', follow_up: '📅',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-teal-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={lead.status} />
              <span className="text-xs text-gray-400">{lead.source}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Contact info */}
          <div className="px-6 py-4 space-y-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-medium hover:bg-cyan-100 transition"
                >
                  <Phone size={13} /> {lead.phone}
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition"
                >
                  <Mail size={13} /> Email
                </a>
              )}
            </div>
          </div>

          {/* Edit form */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Details</h3>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(false); setForm({ ...lead }); }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 text-xs bg-cyan-500 text-white px-2 py-1 rounded font-medium hover:bg-cyan-600 transition"
                  >
                    <Save size={11} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {editing ? (
                <>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                      <input
                        type="tel"
                        value={form.phone || ''}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Email</label>
                      <input
                        type="email"
                        value={form.email || ''}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Follow Up</label>
                      <input
                        type="date"
                        value={form.followUpDate ? form.followUpDate.slice(0, 10) : ''}
                        onChange={(e) => setForm((p) => ({ ...p, followUpDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                    <textarea
                      value={form.notes || ''}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {[
                    { icon: <Phone size={13} />, label: 'Phone', value: lead.phone },
                    { icon: <Mail size={13} />, label: 'Email', value: lead.email },
                    { icon: <Tag size={13} />, label: 'Source', value: lead.source },
                    { icon: <Calendar size={13} />, label: 'Follow Up', value: lead.followUpDate ? formatDate(lead.followUpDate) : null },
                    { icon: <MessageSquare size={13} />, label: 'Notes', value: lead.notes },
                  ].map(({ icon, label, value }) =>
                    value ? (
                      <div key={label} className="flex gap-2">
                        <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
                        <div>
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="text-sm text-gray-800">{value}</p>
                        </div>
                      </div>
                    ) : null
                  )}
                  <div className="text-xs text-gray-400 pt-1">
                    Added {formatDate(lead.createdAt)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Note */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Add Note</h3>
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note..."
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
              <button
                onClick={addNote}
                disabled={addingNote || !newNote.trim()}
                className="px-3 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 transition disabled:opacity-50 self-end"
              >
                Add
              </button>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity Timeline</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400">No activities yet</p>
            ) : (
              <div className="space-y-3">
                {activities.map((a) => (
                  <div key={a._id} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs">
                      {ACTIVITY_ICONS[a.type] || '•'}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{a.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
