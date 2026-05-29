import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '30');
  const skip = (page - 1) * limit;

  const activities = await Activity.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('leadId', 'name phone')
    .lean();

  const total = await Activity.countDocuments();

  return NextResponse.json({ activities, total });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();

  const activity = await Activity.create({
    ...body,
    userId: user.userId,
  });

  await Lead.findByIdAndUpdate(body.leadId, { lastActivity: new Date() });

  return NextResponse.json({ activity }, { status: 201 });
}
