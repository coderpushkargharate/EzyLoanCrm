import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { sendLeadNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // Optional shared-secret check. If LEAD_WEBHOOK_SECRET is configured, the
    // caller (EzyLoan website) must send a matching `x-webhook-secret` header.
    // Left unset = open webhook, so existing integrations keep working.
    const expectedSecret = process.env.LEAD_WEBHOOK_SECRET;
    if (expectedSecret && req.headers.get('x-webhook-secret') !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const { name, email, phone, message, source } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const inquiryNote = message
      ? `Website Inquiry: ${message}`
      : `Lead via ${source || 'Ezy Loan Website'}`;

    // Dedup: the same customer often submits more than once (contact form +
    // Apply Now, or a repeat enquiry). Instead of piling up duplicate cards we
    // match an EXISTING lead by phone (fallback email) and fold the new enquiry
    // into it — append to notes, log an activity, bump lastActivity. Only when
    // no match exists do we create a fresh lead. Matching identifiers are
    // trimmed and case-insensitive (email) so "  9876..." == "9876..." etc.
    const identifierMatch: Record<string, unknown>[] = [];
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    if (trimmedPhone) identifierMatch.push({ phone: trimmedPhone });
    if (trimmedEmail) {
      identifierMatch.push({ email: trimmedEmail.toLowerCase() });
    }

    const existing = identifierMatch.length
      ? await Lead.findOne({ $or: identifierMatch }).sort({ createdAt: -1 })
      : null;

    if (existing) {
      // Fold the repeat enquiry into the known lead — never overwrite the
      // human-managed status/assignment, just enrich it.
      const stamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      existing.notes = `${existing.notes ? existing.notes + '\n\n' : ''}[${stamp}] ${inquiryNote}`;
      existing.lastActivity = new Date();
      // Backfill contact fields the original lead may have been missing.
      if (!existing.email && trimmedEmail) existing.email = trimmedEmail;
      if (!existing.phone && trimmedPhone) existing.phone = trimmedPhone;
      await existing.save();

      await Activity.create({
        leadId: existing._id,
        type: 'note',
        description: `Repeat enquiry from ${source || 'Website Form'}${message ? `: ${message}` : ''}`,
      });

      // Still notify — a returning lead is a hot signal (non-blocking).
      sendLeadNotification({ name, email, phone, message, source }).catch(console.error);

      return NextResponse.json(
        { success: true, leadId: existing._id, deduped: true },
        { status: 200 },
      );
    }

    const lead = await Lead.create({
      name,
      email: trimmedEmail || undefined,
      phone: trimmedPhone || undefined,
      // A loan CRM messages leads on WhatsApp — seed it from the phone so the
      // WhatsApp column is populated out of the box (still editable in the CRM).
      whatsapp: trimmedPhone || undefined,
      notes: inquiryNote,
      source: source || 'Website Form',
      status: 'New',
    });

    await Activity.create({
      leadId: lead._id,
      type: 'created',
      description: `Lead received from ${source || 'Website Form'}`,
    });

    // Send email notification (non-blocking)
    sendLeadNotification({ name, email, phone, message, source }).catch(console.error);

    return NextResponse.json({ success: true, leadId: lead._id }, { status: 201 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
