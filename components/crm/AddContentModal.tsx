'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'document', label: 'Document' },
  { value: 'image', label: 'Image' },
  { value: 'link', label: 'Link' },
  { value: 'article', label: 'Article' },
];

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function AddContentModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState({ title: '', type: 'link', url: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');

    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to save');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add Content</h2>
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

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Personal Loan Brochure"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
            >
              {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Link / URL
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => update('url', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Short description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
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
              {loading ? 'Saving...' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
