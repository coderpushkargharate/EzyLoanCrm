'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Trash2,
  X,
  Phone,
  Mail,
  StickyNote,
  CheckSquare,
  Square,
} from 'lucide-react';
import StatusBadge from '@/components/crm/StatusBadge';
import GroupBadge from '@/components/crm/GroupBadge';
import AddClientModal from '@/components/crm/AddClientModal';
import { GROUPS } from '@/lib/groups';

export interface Lead {
  _id: string;
  name: string;
  displayName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  status: string;
  groups?: string[];
  source?: string;
  opportunitySize?: string;
  leadStage?: string;
  followUpDate?: string;
  lastActivity?: string;
  createdAt: string;
}

const TABS = [
  { key: 'all', label: 'All Clients' },
  { key: 'uncontacted', label: 'Uncontacted' },
  { key: 'followups', label: 'Follow Ups' },
  { key: 'recent', label: 'Recently Viewed Content' },
];

const STATUS_OPTIONS = [
  'All Statuses',
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

// Build a compact list of page numbers with ellipses, e.g. [1, '...', 4, 5, 6, '...', 20]
function getPageRange(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range: (number | string)[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) range.push('...');
  for (let i = start; i <= end; i++) range.push(i);
  if (end < total - 1) range.push('...');
  range.push(total);
  return range;
}

export default function ClientsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [groupFilter, setGroupFilter] = useState('All Groups');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const router = useRouter();

  function openLead(id: string) {
    router.push(`/clients/${id}`);
  }

  const fetchLeads = useCallback(async () => {
    if (activeTab === 'recent') {
      setLeads([]);
      setTotal(0);
      setPages(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ tab: activeTab, page: String(page) });
    if (search) params.set('search', search);
    if (statusFilter !== 'All Statuses') params.set('status', statusFilter);
    if (groupFilter !== 'All Groups') params.set('group', groupFilter);

    const res = await fetch(`/api/leads?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads);
      setTotal(data.total);
      setPages(data.pages || 1);
    }
    setLoading(false);
  }, [activeTab, search, statusFilter, groupFilter, page]);

  useEffect(() => {
    const timer = setTimeout(fetchLeads, 300);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  // Reset to page 1 whenever the filters/tab/search change
  useEffect(() => {
    setPage(1);
  }, [activeTab, search, statusFilter, groupFilter]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l._id)));
    }
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${selectedIds.size} client(s)?`)) return;
    await Promise.all(
      Array.from(selectedIds).map((id) => fetch(`/api/leads/${id}`, { method: 'DELETE' }))
    );
    setSelectedIds(new Set());
    fetchLeads();
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-teal-700 transition shadow-md"
        >
          <Plus size={16} />
          Add New Client
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setSelectedIds(new Set()); }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === t.key
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <Filter size={13} />
              Filter
            </button>

            {showFilter && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="All Groups">All Groups</option>
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </>
            )}

            {selectedIds.size > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100 transition"
              >
                <Trash2 size={13} />
                Delete ({selectedIds.size})
              </button>
            )}
          </div>

          <span className="ml-auto text-xs text-gray-400">{total} clients</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleSelectAll} className="text-gray-400">
                    {selectedIds.size === leads.length && leads.length > 0 ? (
                      <CheckSquare size={15} className="text-cyan-500" />
                    ) : (
                      <Square size={15} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Phone Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Groups</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Follow Up</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Last Activity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-gray-400 text-sm">
                    {activeTab === 'recent'
                      ? 'No recently viewed content yet. Content shared with clients will appear here.'
                      : 'No clients found. Add your first client!'}
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className={`border-b border-gray-50 hover:bg-gray-50/70 transition-colors cursor-pointer group ${
                      selectedIds.has(lead._id) ? 'bg-cyan-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(lead._id)} className="text-gray-400">
                        {selectedIds.has(lead._id) ? (
                          <CheckSquare size={15} className="text-cyan-500" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3" onClick={() => openLead(lead._id)}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 hover:text-cyan-600 transition">
                          {lead.name}
                        </span>
                        <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                        {lead.phone && <span className="text-xs text-gray-500">{lead.phone}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell" onClick={() => openLead(lead._id)}>
                      {lead.phone || '-'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell" onClick={() => openLead(lead._id)}>
                      <span className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                        {lead.notes || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell" onClick={() => openLead(lead._id)}>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell" onClick={() => openLead(lead._id)}>
                      {lead.groups && lead.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {lead.groups.map((g) => (
                            <GroupBadge key={g} group={g} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500" onClick={() => openLead(lead._id)}>
                      {lead.followUpDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(lead.followUpDate)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-sm text-gray-500" onClick={() => openLead(lead._id)}>
                      {formatDate(lead.lastActivity)}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-sm text-gray-500" onClick={() => openLead(lead._id)}>
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && activeTab !== 'recent' && pages > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-5 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {getPageRange(page, pages).map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="w-8 text-center text-gray-400 text-sm select-none">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-full text-sm font-medium transition ${
                    page === p
                      ? 'bg-cyan-50 text-cyan-600 ring-1 ring-cyan-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); fetchLeads(); }}
        />
      )}
    </div>
  );
}
