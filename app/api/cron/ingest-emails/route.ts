import { NextRequest, NextResponse } from 'next/server';
import { ingestLeadEmails } from '@/lib/ingest';

// IMAP needs the Node runtime (not Edge) and a little headroom to read mail.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed if not configured
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get('secret');
  const fromHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return fromQuery === secret || fromHeader === secret;
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await ingestLeadEmails();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Email ingest error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET so it can be triggered by simple cron services (cron-job.org etc.)
export async function GET(req: NextRequest) {
  return handle(req);
}

// POST for Netlify scheduled functions or curl.
export async function POST(req: NextRequest) {
  return handle(req);
}
