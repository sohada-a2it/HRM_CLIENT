// middleware.js - UPDATED VERSION
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { method, nextUrl } = request;
  const pathname = nextUrl.pathname;
  
  console.log(`[Middleware] ${method} ${pathname}`);
  
  // =========== 1. FIRST: Handle HEAD requests ===========
  // This is the MAIN FIX for 403 errors
  if (method === 'HEAD') {
    console.log(`✅ HEAD request handled: ${pathname}`);
    
    // Return 200 OK for all HEAD requests
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache'
      }
    });
  }
  
  // =========== 2. Handle OPTIONS requests ===========
  if (method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  // =========== 3. Authentication check ===========
  // Check token from cookies or localStorage
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('adminToken')?.value ||
                request.cookies.get('authToken')?.value;
  
  const protectedRoutes = [
    '/dashboard',
    '/attendance',
    '/leave',
    '/profile',
    '/payroll',
    '/officeSchedule',
    '/audit',
    '/shift-schedule',
    '/holiday',
    '/user-roles',
    '/meal'
  ];
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // If protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    console.log(`🔒 Redirecting to login from ${pathname}`);
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // =========== 4. Add security headers ===========
  const response = NextResponse.next();
  
  // Add CORS headers to all responses
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};