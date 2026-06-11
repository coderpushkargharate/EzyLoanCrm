'use client';

import { useEffect, useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';

type Provider = 'facebook' | 'whatsapp';

interface Props {
  provider: Provider;
  onClose: () => void;
  onSaved: () => void;
}

const META: Record<Provider, { title: string; webhookPath: string; docsUrl: string }> = {
  facebook: {
    title: 'Facebook & Instagram Lead Ads',
    webhookPath: '/api/webhook/facebook',
    docsUrl: 'https://developers.facebook.com/docs/marketing-api/guides/lead-ads/integration/',
  },
  whatsapp: {
    title: 'WhatsApp Business',
    webhookPath: '/api/webhook/whatsapp',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
  },
};

function randomToken() {
  return 'verify_' + Math.random().toString(36).slice(2, 12);
}

export default function ConfigureIntegrationModal({ provider, onClose, onSaved }: Props) {
  const meta = META[provider];
  const [origin, setOrigin] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [pageAccessToken, setPageAccessToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [tokenSet, setTokenSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch('/api/integrations')
      .then((r) => r.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = (data.items || []).find((i: any) => i.provider === provider);
        const cfg = found?.config || {};
        setVerifyToken(cfg.verifyToken || randomToken());
        setPhoneNumberId(cfg.phoneNumberId || '');
        setTokenSet(Boolean(cfg.pageAccessToken_set || cfg.accessToken_set));
      })
      .finally(() => setLoading(false));
  }, [provider]);

  const webhookUrl = origin ? `${origin}${meta.webhookPath}` : meta.webhookPath;

  function copyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function save() {
    if (!verifyToken.trim()) { setError('Verify token is required'); return; }
    setSaving(true);
    setError('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: Record<string, any> = { verifyToken: verifyToken.trim() };
    if (provider === 'facebook') {
      if (pageAccessToken.trim()) config.pageAccessToken = pageAccessToken.trim();
    } else {
      if (accessToken.trim()) config.accessToken = accessToken.trim();
      config.phoneNumberId = phoneNumberId.trim();
    }

    const res = await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, enabled: true, config }),
    });

    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to save');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Configure {meta.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : (
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            {/* Steps */}
            <ol className="text-xs text-gray-600 space-y-1.5 bg-gray-50 border border-gray-200 rounded-lg p-3 list-decimal list-inside">
              {provider === 'facebook' ? (
                <>
                  <li>Open your Facebook App → <strong>Webhooks</strong> → add a <strong>Page</strong> subscription.</li>
                  <li>Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> below into Facebook.</li>
                  <li>Subscribe to the <strong>leadgen</strong> field.</li>
                  <li>Generate a <strong>Page Access Token</strong> and paste it below, then Save.</li>
                </>
              ) : (
                <>
                  <li>Open Meta → <strong>WhatsApp → Configuration</strong>.</li>
                  <li>Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> below into Meta.</li>
                  <li>Subscribe to the <strong>messages</strong> field.</li>
                  <li>Paste your <strong>Access Token</strong> &amp; <strong>Phone Number ID</strong> below, then Save.</li>
                </>
              )}
            </ol>

            {/* Webhook URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Callback / Webhook URL
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={webhookUrl}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-mono"
                />
                <button
                  onClick={copyWebhook}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
              </div>
              {origin.includes('localhost') && (
                <p className="text-xs text-amber-600 mt-1">
                  Note: Facebook/Meta cannot reach localhost — use your deployed (https) URL for the real setup.
                </p>
              )}
            </div>

            {/* Verify Token */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Verify Token
              </label>
              <input
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Any text you like — paste the exact same value into Meta.</p>
            </div>

            {provider === 'facebook' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Page Access Token {tokenSet && <span className="text-green-600 normal-case">(saved — leave blank to keep)</span>}
                </label>
                <input
                  type="password"
                  value={pageAccessToken}
                  onChange={(e) => setPageAccessToken(e.target.value)}
                  placeholder={tokenSet ? '••••••••' : 'Paste Page Access Token'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Access Token {tokenSet && <span className="text-green-600 normal-case">(saved — leave blank to keep)</span>}
                  </label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder={tokenSet ? '••••••••' : 'Paste WhatsApp Access Token'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Phone Number ID
                  </label>
                  <input
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="e.g. 123456789012345"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </>
            )}

            <a
              href={meta.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700"
            >
              <ExternalLink size={11} /> Official setup guide
            </a>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-teal-700 transition disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save & Connect'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
