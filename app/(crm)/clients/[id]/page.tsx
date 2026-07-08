'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Phone,
  MessageCircle,
  Send,
  Smartphone,
  ChevronDown,
  Calendar,
  Plus,
  MoreVertical,
  Trash2,
  Check,
  Activity as ActivityIcon,
  X,
} from 'lucide-react';
import { GROUPS, groupStyle } from '@/lib/groups';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  'New', 'No Response', 'Cold', 'Warm',
  '1. Interested', '0. Not Interested', 'Lost', 'Converted', 'Out Of Odisha',
];

interface Lead {
  _id: string;
  name: string;
  displayName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  status: string;
  source?: string;
  opportunitySize?: string;
  leadStage?: string;
  followUpDate?: string;
  groups?: string[];
  createdAt: string;
}

interface Activity {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
}

const ACTIVITY_ICONS: Record<string, string> = {
  note: '📝', call: '📞', email: '📧', meeting: '🤝',
  status_change: '🔄', created: '✨', follow_up: '📅',
};

function statusPillClass(status: string) {
  if (status === 'New') return 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white';
  if (status === 'Converted') return 'bg-emerald-500 text-white';
  if (status === 'Lost' || status === '0. Not Interested') return 'bg-gray-700 text-white';
  if (status === '1. Interested' || status === 'Warm') return 'bg-teal-500 text-white';
  return 'bg-sky-500 text-white';
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusOpen, setStatusOpen] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [addingActivity, setAddingActivity] = useState(false);
  const [newNote, setNewNote] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/leads/${id}`);
    if (res.ok) {
      const data = await res.json();
      setLead(data.lead);
      setActivities(data.activities || []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function patch(fields: Partial<Lead>) {
    if (!lead) return;
    setLead({ ...lead, ...fields });
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (res.ok) {
      const data = await res.json();
      setLead(data.lead);
      // status change adds an activity — refresh timeline
      if (fields.status) load();
    }
  }

  function toggleGroup(group: string) {
    if (!lead) return;
    const current = lead.groups || [];
    const next = current.includes(group)
      ? current.filter((g) => g !== group)
      : [...current, group];
    patch({ groups: next });
  }

  async function addActivity() {
    if (!newNote.trim()) return;
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: id, type: 'note', description: newNote }),
    });
    setNewNote('');
    setAddingActivity(false);
    load();
  }

  async function handleDelete() {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    router.push('/clients');
  }

  function formatDate(d?: string) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-gray-200" />
          <div className="h-96 bg-white rounded-2xl border border-gray-200" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Client not found.</p>
        <Link href="/clients" className="text-cyan-600 text-sm font-medium mt-2 inline-block">← Back to Clients</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
        <Link href="/clients" className="hover:text-gray-700 font-medium">Clients</Link>
        <span>›</span>
        <span className="text-gray-700">{lead.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
        <div className="flex items-center gap-2">
          <a
            href={lead.whatsapp || lead.phone ? `https://wa.me/${(lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '')}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 transition"
          >
            <Send size={14} /> Send Quick Response
          </a>
          <span className="hidden sm:flex items-center gap-1.5 bg-sky-100 text-sky-700 px-4 py-2 rounded-lg text-sm font-semibold">
            View on App <Smartphone size={14} />
          </span>
          <div className="relative">
            <button
              onClick={() => setOptionsOpen((o) => !o)}
              className="flex items-center gap-1 text-sm text-gray-600 px-2 py-2 rounded-lg hover:bg-gray-100"
            >
              Options <MoreVertical size={15} />
            </button>
            {optionsOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete Client
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status + Follow up row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Status pill */}
        <div className="relative">
          <button
            onClick={() => { setStatusOpen((o) => !o); setFollowOpen(false); }}
            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide shadow-sm', statusPillClass(lead.status))}
          >
            <ActivityIcon size={15} />
            {lead.status === 'New' ? 'Uncontacted' : lead.status}
            <ChevronDown size={15} />
          </button>
          {statusOpen && (
            <div className="absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 max-h-72 overflow-y-auto">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { patch({ status: s }); setStatusOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {s}
                  {lead.status === s && <Check size={14} className="text-teal-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Follow up */}
        <div className="relative">
          <button
            onClick={() => { setFollowOpen((o) => !o); setStatusOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50"
          >
            <Calendar size={15} className="text-gray-400" />
            {lead.followUpDate
              ? new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'No Follow Up Scheduled'}
            <ChevronDown size={15} />
          </button>
          {followOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-30">
              <label className="text-xs text-gray-500 mb-1 block">Schedule a follow up</label>
              <input
                type="date"
                value={lead.followUpDate ? lead.followUpDate.slice(0, 10) : ''}
                onChange={(e) => { patch({ followUpDate: e.target.value }); }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {lead.followUpDate && (
                <button
                  onClick={() => { patch({ followUpDate: '' }); setFollowOpen(false); }}
                  className="mt-2 text-xs text-red-500 hover:text-red-600"
                >
                  Clear follow up
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Client Info</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {/* Left column of fields */}
              <div className="space-y-5">
                <EditableField label="DISPLAY NAME" value={lead.displayName} placeholder="No Display Name" onSave={(v) => patch({ displayName: v })} />
                <EditableField label="MOBILE NUMBER" value={lead.phone} placeholder="Click to add..." onSave={(v) => patch({ phone: v })}
                  action={lead.phone ? <a href={`tel:${lead.phone}`} className="text-teal-500"><Phone size={17} /></a> : null} />
                <EditableField label="WHATSAPP NUMBER" value={lead.whatsapp || lead.phone} placeholder="Click to add..." onSave={(v) => patch({ whatsapp: v })}
                  action={(lead.whatsapp || lead.phone) ? <a href={`https://wa.me/${(lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-500"><MessageCircle size={17} /></a> : null} />
                <EditableField label="EMAIL ADDRESS" value={lead.email} placeholder="Click to add..." onSave={(v) => patch({ email: v })} />
                <EditableField label="OPPORTUNITY SIZE" value={lead.opportunitySize} placeholder="Click to enter a value..." onSave={(v) => patch({ opportunitySize: v })} />
                <EditableField label="LEAD STAGE" value={lead.leadStage} placeholder="Click to select a value..." onSave={(v) => patch({ leadStage: v })} />
              </div>

              {/* Right column: groups, capi, notes */}
              <div className="space-y-5">
                {/* Groups */}
                <div className="relative">
                  <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5">GROUPS</p>
                  <button onClick={() => setGroupsOpen((o) => !o)} className="w-full text-left">
                    {lead.groups && lead.groups.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {lead.groups.map((g) => (
                          <span key={g} className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', groupStyle(g))}>{g}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Click to add groups</span>
                    )}
                  </button>
                  {groupsOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 max-h-72 overflow-y-auto">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500">Select Groups</span>
                        <button onClick={() => setGroupsOpen(false)}><X size={14} className="text-gray-400" /></button>
                      </div>
                      {GROUPS.map((g) => {
                        const active = (lead.groups || []).includes(g);
                        return (
                          <button
                            key={g}
                            onClick={() => toggleGroup(g)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            <span className="flex items-center gap-2">
                              <span className={cn('w-3 h-3 rounded-sm', groupStyle(g).split(' ')[0])} />
                              <span className="text-gray-700">{g}</span>
                            </span>
                            {active && <Check size={14} className="text-teal-500" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Meta CAPI */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5">META CAPI V1 STATUS</p>
                  <p className="text-sm text-gray-400">Not qualified yet.</p>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5">NOTES</p>
                  <EditableNotes value={lead.notes} onSave={(v) => patch({ notes: v })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail: Sequences + Timeline */}
        <div className="space-y-6">
          {/* Sequences */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">Sequences</h2>
              <button className="flex items-center gap-1 text-sm text-teal-600 font-semibold">
                <Plus size={15} /> Add to Sequence
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
              <ActivityIcon size={26} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Not currently part of any sequences</p>
              <p className="text-xs text-gray-400 mt-1">Tap the &lsquo;+ Add to Sequence&rsquo; button above to add</p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Timeline</h2>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              {!addingActivity ? (
                <button
                  onClick={() => setAddingActivity(true)}
                  className="flex items-center gap-2 text-teal-600 font-semibold text-sm mb-4"
                >
                  <span className="w-6 h-6 rounded-full border-2 border-teal-500 flex items-center justify-center"><Plus size={13} /></span>
                  Add Activity
                </button>
              ) : (
                <div className="mb-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log a note, call, or meeting..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={addActivity} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-semibold hover:bg-teal-600">Save</button>
                    <button onClick={() => { setAddingActivity(false); setNewNote(''); }} className="px-3 py-1.5 text-gray-500 text-xs">Cancel</button>
                  </div>
                </div>
              )}

              {activities.length === 0 ? (
                <p className="text-sm text-gray-400">No activity yet.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((a) => (
                    <div key={a._id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs">
                        {ACTIVITY_ICONS[a.type] || '•'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{a.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- inline editable text field ---- */
function EditableField({
  label, value, placeholder, onSave, action,
}: {
  label: string;
  value?: string;
  placeholder: string;
  onSave: (v: string) => void;
  action?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? '');

  useEffect(() => { setVal(value ?? ''); }, [value]);

  function commit() {
    setEditing(false);
    if ((val ?? '') !== (value ?? '')) onSave(val.trim());
  }

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5">{label}</p>
        {editing ? (
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value ?? ''); setEditing(false); } }}
            autoFocus
            className="w-full px-2 py-1 border border-cyan-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-left w-full">
            <span className={value ? 'text-sm text-gray-800' : 'text-sm text-gray-400'}>
              {value || placeholder}
            </span>
          </button>
        )}
      </div>
      {action && <div className="pt-5 flex-shrink-0">{action}</div>}
    </div>
  );
}

/* ---- inline editable notes ---- */
function EditableNotes({ value, onSave }: { value?: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? '');

  useEffect(() => { setVal(value ?? ''); }, [value]);

  if (editing) {
    return (
      <div>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          rows={5}
          autoFocus
          className="w-full px-3 py-2 border border-cyan-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => { setEditing(false); onSave(val); }}
            className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-semibold hover:bg-teal-600"
          >
            Save
          </button>
          <button onClick={() => { setVal(value ?? ''); setEditing(false); }} className="px-3 py-1.5 text-gray-500 text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="text-left w-full">
      {value ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">{value}</p>
      ) : (
        <span className="text-sm text-gray-400">Click to add notes...</span>
      )}
    </button>
  );
}
