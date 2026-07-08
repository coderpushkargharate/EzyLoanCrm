import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser, signToken } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const user = await User.findById(auth.userId)
    .select('name email role avatar phone whatsapp company settings')
    .lean();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();

  // Only allow a safe subset of fields to be updated
  const allowed: Record<string, unknown> = {};
  for (const key of ['name', 'phone', 'whatsapp', 'company', 'avatar'] as const) {
    if (body[key] !== undefined) allowed[key] = body[key];
  }
  if (body.settings && typeof body.settings === 'object') {
    allowed.settings = body.settings;
  }

  const user = await User.findByIdAndUpdate(auth.userId, allowed, { new: true })
    .select('name email role avatar phone whatsapp company settings')
    .lean();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const response = NextResponse.json({ user });

  // Re-issue the auth cookie so the displayed name/email stay in sync
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any;
  const token = await signToken({ userId: auth.userId, email: u.email, name: u.name });
  response.cookies.set('crm_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
