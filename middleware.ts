import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow preview frame
  const headers = new Headers(request.headers);
  headers.set('x-middleware-next', '1');

  // Redirect root path to /notebook
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/notebook', request.url));
  }

  return NextResponse.next({
    request: {
      headers
    }
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};