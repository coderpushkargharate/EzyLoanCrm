'use client';

import { useState } from 'react';
import { FileText, Image, Link, Plus, BookOpen } from 'lucide-react';

const CONTENT_TYPES = [
  { icon: <FileText size={20} className="text-cyan-600" />, label: 'Documents', count: 0, color: 'bg-cyan-50' },
  { icon: <Image size={20} className="text-blue-600" />, label: 'Images', count: 0, color: 'bg-blue-50' },
  { icon: <Link size={20} className="text-teal-600" />, label: 'Links', count: 0, color: 'bg-teal-50' },
  { icon: <BookOpen size={20} className="text-orange-600" />, label: 'Articles', count: 0, color: 'bg-orange-50' },
];

export default function ContentPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content</h1>
        <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-teal-700 transition shadow-md">
          <Plus size={16} />
          Add Content
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {CONTENT_TYPES.map((t) => (
          <div key={t.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition cursor-pointer">
            <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center mb-3`}>
              {t.icon}
            </div>
            <p className="text-sm font-semibold text-gray-900">{t.label}</p>
            <p className="text-2xl font-bold text-gray-700 mt-1">{t.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-16 shadow-sm text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={28} className="text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">No content yet</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
          Add documents, images, links, and articles to share with your clients
        </p>
        <button className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-teal-700 transition">
          <Plus size={16} />
          Add Your First Content
        </button>
      </div>
    </div>
  );
}
