// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle customer-app API routes with CORS
  if (pathname.startsWith('/api/customer-app')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Handle delivery-app API routes with CORS
  if (pathname.startsWith('/api/delivery-app')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const isSuperAdmin = token?.isSuperAdmin === true;

  // Public routes
  const publicRoutes = ['/', '/login', '/register', '/pricing', '/contact', '/terms', '/privacy'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/webhooks');
  
  if (isPublicRoute) {
    if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
      if (isSuperAdmin) {
        return NextResponse.redirect(new URL('/super-admin', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Super admin routes
  if (pathname.startsWith('/super-admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  const protectedPrefixes = [
    '/dashboard',
    '/orders',
    '/customers',
    '/services',
    '/workshop',
    '/settings',
    '/calendar',
    '/inventory',
    '/expenses',
    '/create-order',
    '/order-review',
    '/stores',
    '/items',
    '/services',
    '/notifications',
    '/drivers',
  ];

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === '/dashboard' && isSuperAdmin) {
      return NextResponse.redirect(new URL('/super-admin', request.url));
    }

    return NextResponse.next();
  }

  // API routes protection
  if (pathname.startsWith('/api/')) {
    const publicApiRoutes = [
      '/api/auth',
      '/api/webhooks',
      '/api/customer-app',
      '/api/delivery-app',
    ];
    
    const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));
    
    if (!isPublicApi && !isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|images|sounds).*)',
  ],
};