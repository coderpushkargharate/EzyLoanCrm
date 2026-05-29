'use client';

import { ExternalLink, Globe, Facebook, Linkedin, Settings, Upload, Download, Zap, MessageCircle } from 'lucide-react';

const LEAD_SOURCES = [
  {
    icon: <Globe size={20} className="text-cyan-600" />,
    title: 'Website Forms',
    description: 'Receive new leads from your website contact forms automatically',
    status: 'connected',
    bg: 'bg-cyan-50',
  },
  {
    icon: <Facebook size={20} className="text-blue-600" />,
    title: 'Facebook',
    description: 'Receive new leads from Facebook & Instagram Lead Ads',
    status: 'configure',
    bg: 'bg-blue-50',
  },
  {
    icon: <Linkedin size={20} className="text-sky-700" />,
    title: 'LinkedIn',
    description: 'Receive new leads from LinkedIn Lead Generation ads',
    status: 'not_connected',
    bg: 'bg-sky-50',
  },
  {
    icon: <Globe size={20} className="text-gray-600" />,
    title: 'WordPress Websites',
    description: 'Receive new leads from your WordPress website contact forms',
    status: 'not_connected',
    bg: 'bg-gray-50',
  },
  {
    icon: <MessageCircle size={20} className="text-green-600" />,
    title: 'WhatsApp Chats',
    description: 'Automatically create leads in CRM from your WhatsApp conversations',
    status: 'configure',
    bg: 'bg-green-50',
  },
];

const AUTOMATIONS = [
  { icon: <MessageCircle size={18} className="text-green-600" />, title: 'WhatsApp Auto-Responder', desc: 'Instantly message new leads on WhatsApp' },
  { icon: <Zap size={18} className="text-orange-600" />, title: 'Lead Automation Rules', desc: 'Assign leads to team members via rules and/or round robin' },
  { icon: <Zap size={18} className="text-blue-600" />, title: 'Lead Distribution', desc: 'Forward a copy of new leads to one or more recipients' },
  { icon: <Zap size={18} className="text-purple-600" />, title: 'Duplicate Lead Merging', desc: 'Automatically merge duplicate leads with same phone/email' },
];

export default function AutomationsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
      </div>

      {/* API endpoint info box */}
      <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-teal-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-teal-800">Website Form Integration Active</p>
            <p className="text-xs text-teal-700 mt-1">
              Send POST requests to{' '}
              <code className="bg-teal-100 px-1.5 py-0.5 rounded font-mono text-xs">
                /api/webhook/lead
              </code>{' '}
              to automatically add leads from your website.
            </p>
            <div className="mt-2 bg-white rounded-lg border border-teal-200 p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Required JSON body:</p>
              <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
{`{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "message": "I need a loan",
  "source": "Website Form"
}`}
              </pre>
            </div>
            <p className="text-xs text-teal-600 mt-2">
              New leads are automatically emailed to <strong>dibyanshassociates@gmail.com</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Lead Source Integrations */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Lead Source Integrations</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Connect your website, lead ads, and other sources for instant lead alerts
            </p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-cyan-600 font-semibold hover:text-cyan-700">
            View All <ExternalLink size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {LEAD_SOURCES.map((s) => (
            <div key={s.title} className="p-5 hover:bg-gray-50/50 transition">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">{s.description}</p>
              <div className="flex items-center justify-between">
                {s.status === 'connected' && (
                  <span className="text-xs text-green-600 font-medium">Connected</span>
                )}
                {s.status === 'configure' && (
                  <span className="text-xs text-gray-400">-</span>
                )}
                {s.status === 'not_connected' && (
                  <span className="text-xs text-gray-400">Not Connected</span>
                )}
                <button className="text-xs text-cyan-600 font-medium hover:text-cyan-700 flex items-center gap-0.5">
                  {s.status === 'connected' ? 'Configure' : 'Connect'} &rsaquo;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Automations */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Lead Automations</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure rules that run whenever a lead is received
            </p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-cyan-600 font-semibold hover:text-cyan-700">
            View All <ExternalLink size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {AUTOMATIONS.map((a) => (
            <div key={a.title} className="p-5 hover:bg-gray-50/50 transition">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {a.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 mb-2">{a.desc}</p>
                  <button className="text-xs text-cyan-600 font-medium hover:text-cyan-700">
                    Configure &rsaquo;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import / Export */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Import &amp; Export Data</h2>
          <p className="text-xs text-gray-500 mt-0.5">Bulk import clients from a spreadsheet or export your data</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          <div className="p-5 hover:bg-gray-50/50 transition">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Upload size={16} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Import Clients from CSV</h3>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">Bulk import contacts from a CSV file</p>
                <button className="text-xs text-cyan-600 font-medium hover:text-cyan-700">
                  Configure &rsaquo;
                </button>
              </div>
            </div>
          </div>
          <div className="p-5 hover:bg-gray-50/50 transition">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Download size={16} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Export Client List</h3>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">Download your client list in CSV format</p>
                <button className="text-xs text-cyan-600 font-medium hover:text-cyan-700">
                  Configure &rsaquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
