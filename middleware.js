import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('auth')?.value;
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('next', pathname + search);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
