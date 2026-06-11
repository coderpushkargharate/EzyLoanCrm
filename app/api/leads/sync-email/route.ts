import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { ingestLeadEmails } from '@/lib/ingest';

// IMAP needs the Node runtime and a little headroom to read mail.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Triggered by the "Sync now" button on the Automations page. Auth is the
// logged-in CRM user, so no shared secret is exposed to the browser.
export async function POST(_req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await ingestLeadEmails();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Email sync error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
