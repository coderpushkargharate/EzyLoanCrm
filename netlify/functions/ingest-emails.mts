// Netlify Scheduled Function — runs automatically every 5 minutes and asks the
// CRM to read the inbox and import any new form-submission emails as leads.
// Netlify injects URL + env vars at runtime.

export const config = {
  schedule: '*/5 * * * *',
};

export default async () => {
  const base =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.CRON_SECRET;

  if (!base || !secret) {
    console.error('ingest-emails: missing URL or CRON_SECRET env');
    return new Response('Missing URL or CRON_SECRET', { status: 500 });
  }

  const res = await fetch(
    `${base}/api/cron/ingest-emails?secret=${encodeURIComponent(secret)}`,
    { method: 'POST' }
  );
  const body = await res.text();
  console.log('ingest-emails result', res.status, body);
  return new Response(body, { status: res.status });
};
