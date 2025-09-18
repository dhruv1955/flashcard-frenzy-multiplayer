import { NextResponse, type NextRequest } from 'next/server';

// Protect all routes under /app that are not public. Adjust patterns as needed.
const PUBLIC_PATHS = new Set<string>([
  '/',
  '/login',
  '/signup',
  '/api/auth/callback',
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api/public')) {
    const res = NextResponse.next();
    // security headers
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=()');
    return res;
  }

  // Read the Supabase auth cookie set by @supabase/ssr
  const hasAuth = req.cookies.has('sb-access-token') || req.cookies.has('sb:token');
  if (!hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=()');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};


