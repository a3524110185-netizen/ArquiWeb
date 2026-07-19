import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const SUPER_ADMIN_PATHS = ['/super-admin'];

function parseToken(token: string): { authRole: string; exp: number } | null {
  try {
    const data = JSON.parse(atob(token));
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Get auth token from cookie
  const token = request.cookies.get('auth_token')?.value;

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token
  const payload = parseToken(token);
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }

  // Super admin route guard: only SuperAdmin can access /super-admin
  if (SUPER_ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    if (payload.authRole !== 'SuperAdmin') {
      const dashUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
