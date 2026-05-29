import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const lead = await Lead.findById(params.id).lean();
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const activities = await Activity.find({ leadId: params.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ lead, activities });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const existing = await Lead.findById(params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (body.status && body.status !== existing.status) {
    await Activity.create({
      leadId: params.id,
      userId: user.userId,
      type: 'status_change',
      description: `Status changed from "${existing.status}" to "${body.status}"`,
    });
  }

  const lead = await Lead.findByIdAndUpdate(
    params.id,
    { ...body, lastActivity: new Date() },
    { new: true }
  ).lean();

  return NextResponse.json({ lead });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  await Lead.findByIdAndDelete(params.id);
  await Activity.deleteMany({ leadId: params.id });

  return NextResponse.json({ success: true });
}
