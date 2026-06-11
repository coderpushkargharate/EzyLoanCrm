import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const items = await Content.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const item = await Content.create({
    title: body.title.trim(),
    type: body.type || 'link',
    url: body.url?.trim() || undefined,
    description: body.description?.trim() || undefined,
  });

  return NextResponse.json({ item }, { status: 201 });
}
