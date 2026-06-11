import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Integration from '@/models/Integration';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { sendLeadNotification } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// WhatsApp Cloud API webhook. Configure this URL + Verify Token in
// Meta → WhatsApp → Configuration → Webhook, and subscribe to "messages".

export async function GET(req: NextRequest) {
  await connectDB();
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const wa = await Integration.findOne({ provider: 'whatsapp' }).lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verifyToken = (wa as any)?.config?.verifyToken;

  if (mode === 'subscribe' && token && token === verifyToken) {
    return new NextResponse(challenge || '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const wa = await Integration.findOne({ provider: 'whatsapp' }).lean();
    if (!wa) return NextResponse.json({ received: true });

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const contactName = value.contacts?.[0]?.profile?.name as string | undefined;

        for (const msg of value.messages || []) {
          const from = msg.from as string | undefined; // sender phone number
          if (!from) continue;
          const text =
            msg.text?.body ||
            msg.button?.text ||
            msg.interactive?.list_reply?.title ||
            msg.interactive?.button_reply?.title ||
            '(non-text message)';

          // One lead per phone number — repeat messages append an activity.
          const existing = await Lead.findOne({ phone: from });
          if (existing) {
            await Activity.create({
              leadId: existing._id,
              type: 'note',
              description: `WhatsApp message: ${text}`,
            });
            await Lead.findByIdAndUpdate(existing._id, { lastActivity: new Date() });
            continue;
          }

          const name = contactName || `WhatsApp ${from}`;
          const lead = await Lead.create({
            name,
            phone: from,
            notes: `WhatsApp message: ${text}`,
            source: 'WhatsApp',
            sourceMessageId: msg.id ? `wa:${msg.id}` : undefined,
            status: 'New',
          });

          await Activity.create({
            leadId: lead._id,
            type: 'created',
            description: 'Lead received from WhatsApp',
          });

          sendLeadNotification({ name, phone: from, message: text, source: 'WhatsApp' }).catch(console.error);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
