import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Auto-create admin on first login
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const adminEmail = process.env.ADMIN_EMAIL || 'pushkargharate3011@gmail.com';
      const adminPass = process.env.ADMIN_PASSWORD || 'pushkar3011';
      if (email.toLowerCase() === adminEmail.toLowerCase() && password === adminPass) {
        const hashed = await bcrypt.hash(password, 10);
        user = await User.create({
          name: 'Chandan Mohanty',
          email: adminEmail.toLowerCase(),
          password: hashed,
          role: 'admin',
        });
      } else {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set('crm_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
