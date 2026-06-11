'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Image as ImageIcon, Link as LinkIcon, BookOpen, Plus, Trash2, ExternalLink } from 'lucide-react';
import AddContentModal from '@/components/crm/AddContentModal';

interface ContentItem {
  _id: string;
  title: string;
  type: 'document' | 'image' | 'link' | 'article';
  url?: string;
  description?: string;
  createdAt: string;
}

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  document: { icon: <FileText size={18} className="text-cyan-600" />, label: 'Document', color: 'bg-cyan-50' },
  image: { icon: <ImageIcon size={18} className="text-blue-600" />, label: 'Image', color: 'bg-blue-50' },
  link: { icon: <LinkIcon size={18} className="text-teal-600" />, label: 'Link', color: 'bg-teal-50' },
  article: { icon: <BookOpen size={18} className="text-orange-600" />, label: 'Article', color: 'bg-orange-50' },
};

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/content');
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function remove(id: string) {
    if (!confirm('Delete this content?')) return;
    await fetch(`/api/content/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  const counts = (['document', 'image', 'link', 'article'] as const).map((type) => ({
    type,
    count: items.filter((i) => i.type === type).length,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-teal-700 transition shadow-md"
        >
          <Plus size={16} />
          Add Content
        </button>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {counts.map(({ type, count }) => {
          const meta = TYPE_META[type];
          return (
            <div key={type} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center mb-3`}>
                {meta.icon}
              </div>
              <p className="text-sm font-semibold text-gray-900">{meta.label}s</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm shadow-sm">
          Loading content...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No content yet</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Add documents, images, links, and articles to share with your clients
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-teal-700 transition"
          >
            <Plus size={16} />
            Add Your First Content
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-50">
          {items.map((item) => {
            const meta = TYPE_META[item.type];
            return (
              <div key={item._id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition group">
                <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center flex-shrink-0`}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded">{meta.label}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 mt-1"
                    >
                      <ExternalLink size={11} /> Open link
                    </a>
                  )}
                </div>
                <button
                  onClick={() => remove(item._id)}
                  className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <AddContentModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchItems(); }}
        />
      )}
    </div>
  );
}
