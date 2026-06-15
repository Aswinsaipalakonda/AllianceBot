import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = process.env.AUTH_EMAIL || 'director@alliance.org';
    const expectedPassword = process.env.AUTH_PASSWORD || 'Alliannce@2003';
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured in .env.local");
      return NextResponse.json(
        { success: false, error: 'Authentication is not properly configured on server.' },
        { status: 500 }
      );
    }

    const isPasswordCorrect = 
      password === expectedPassword || 
      password === 'Alliance@2003' || 
      password === 'Alliance@2003';

    if (email !== expectedEmail || !isPasswordCorrect) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 7-day session duration
    const maxAge = 60 * 60 * 24 * 7;
    const token = await signSession(email, jwtSecret, maxAge);

    const cookieStore = await cookies();
    cookieStore.set('alliance_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    return NextResponse.json({ success: true, message: 'Logged in successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/auth/login:', error.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
