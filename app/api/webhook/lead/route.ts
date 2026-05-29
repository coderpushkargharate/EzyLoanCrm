import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { sendLeadNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, email, phone, message, source } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const lead = await Lead.create({
      name,
      email: email || undefined,
      phone: phone || undefined,
      notes: message ? `Website Inquiry: ${message}` : 'Facebook Lead via Ezy Loan',
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
