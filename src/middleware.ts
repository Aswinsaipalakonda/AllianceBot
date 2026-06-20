import { NextResponse, NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname.toLowerCase();

  // 1. Meta Webhook routes must remain completely public
  if (pathname.startsWith('/api/webhook')) {
    return NextResponse.next();
  }

  // 2. Login endpoint must be public
  if (pathname === '/api/auth/login') {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('alliance_session')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  let email: string | null = null;
  if (sessionCookie && jwtSecret) {
    email = await verifySession(sessionCookie, jwtSecret);
  }

  const isAuthenticated = !!email;

  // 3. If NOT authenticated, block and redirect to /login
  if (!isAuthenticated && pathname !== '/login') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. If ALREADY authenticated, redirect away from /login to dashboard
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files or public files:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.jpg, icon.jpg, brochure files
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.jpg|icon.jpg|bba.jpeg|hotel.jpeg|Alliance College_Brochure_V5.pdf).*)',
  ],
};
