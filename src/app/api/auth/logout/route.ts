import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('alliance_session');
    return NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/auth/logout:', error.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
