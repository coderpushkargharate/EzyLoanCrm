import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Integration from '@/models/Integration';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { sendLeadNotification } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Facebook & Instagram Lead Ads both deliver here (Instagram leads flow through
// the connected Facebook Page). Configure this URL + Verify Token in your
// Facebook App → Webhooks → Page → "leadgen" field.

// 1) Verification handshake when you add the webhook in the FB App dashboard.
export async function GET(req: NextRequest) {
  await connectDB();
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const fb = await Integration.findOne({ provider: 'facebook' }).lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verifyToken = (fb as any)?.config?.verifyToken;

  if (mode === 'subscribe' && token && token === verifyToken) {
    return new NextResponse(challenge || '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// 2) Lead delivery. FB sends leadgen events; we fetch the full lead via Graph API.
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const fb = await Integration.findOne({ provider: 'facebook' }).lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageAccessToken = (fb as any)?.config?.pageAccessToken;

    if (!fb || !pageAccessToken) {
      console.error('Facebook webhook: integration not configured');
      return NextResponse.json({ received: true }); // ack so FB stops retrying
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'leadgen') continue;
        const leadgenId = change.value?.leadgen_id;
        if (!leadgenId) continue;

        // Whether it came from Instagram or Facebook
        const platform = change.value?.ad_id && change.value?.platform === 'ig' ? 'Instagram' : 'Facebook';

        try {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${encodeURIComponent(pageAccessToken)}`
          );
          const data = await res.json();

          if (!res.ok) {
            console.error('Graph API error fetching lead', data);
            continue;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fields: Record<string, string> = {};
          for (const f of data.field_data || []) {
            fields[f.name?.toLowerCase()] = (f.values && f.values[0]) || '';
          }

          const name =
            fields['full_name'] ||
            [fields['first_name'], fields['last_name']].filter(Boolean).join(' ').trim() ||
            fields['name'] ||
            'Facebook Lead';
          const email = fields['email'] || undefined;
          const phone = fields['phone_number'] || fields['phone'] || undefined;

          // Dedupe on the FB leadgen id
          const existing = await Lead.findOne({ sourceMessageId: `fb:${leadgenId}` }).lean();
          if (existing) continue;

          const lead = await Lead.create({
            name,
            email,
            phone,
            notes: `${platform} Lead Ad`,
            source: `${platform} Lead Ad`,
            sourceMessageId: `fb:${leadgenId}`,
            status: 'New',
          });

          await Activity.create({
            leadId: lead._id,
            type: 'created',
            description: `Lead received from ${platform} Lead Ad`,
          });

          sendLeadNotification({ name, email, phone, source: `${platform} Lead Ad` }).catch(console.error);
        } catch (err) {
          console.error('Failed to process leadgen', leadgenId, err);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Facebook webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
