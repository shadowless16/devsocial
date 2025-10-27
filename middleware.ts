import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { apiRateLimiter, authRateLimiter } from "@/middleware/rate-limit"

const isDev = process.env.NODE_ENV === 'development'
const shouldLog = process.env.LOG_MIDDLEWARE === 'true'

export default withAuth(
  async function middleware(req: NextRequest) {
    // Apply rate limiting to API routes
    if (req.nextUrl.pathname.startsWith("/api")) {
      // Use stricter rate limiting for auth endpoints
      if (req.nextUrl.pathname.startsWith("/api/auth/login") || 
          req.nextUrl.pathname.startsWith("/api/auth/signup")) {
        const rateLimitResponse = authRateLimiter(req);
        if (rateLimitResponse) return rateLimitResponse;
      } else {
        const rateLimitResponse = apiRateLimiter(req);
        if (rateLimitResponse) return rateLimitResponse;
      }
    }

    // Handle onboarding redirects for authenticated users
    const token = await getToken({ req })
    const { pathname } = req.nextUrl

    // If user is authenticated and tries to access auth pages, redirect to home
    if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/home', req.url))
    }
    
    // Redirect root authenticated route to home
    if (token && pathname === '/') {
      return NextResponse.redirect(new URL('/home', req.url))
    }

    // Allow onboarding page for authenticated users
    if (pathname === '/onboarding' && token) {
      return NextResponse.next()
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Reduce middleware logging noise
        if (shouldLog && pathname.startsWith('/api/')) {
          console.log(`[Middleware] Protecting route: ${pathname}`);
          if (token) {
            console.log(`[Middleware] Success: User ${token.username || 'unknown'} authenticated.`);
          }
        }
        
        // Allow public access to auth pages, onboarding, and trending
        if (pathname.startsWith('/auth') || pathname === '/onboarding' || pathname.startsWith('/trending')) {
          return true;
        }
        
        // For all other routes, require authentication
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/login',
      error: '/auth/error',
    },
  }
)

// Protect all routes under /authenticated
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (all API routes)
     * - auth (login/signup pages)
     * - onboarding (onboarding page)
     * - trending (public trending page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (well-known URIs)
     */
    "/((?!api|auth|onboarding|trending|_next/static|_next/image|favicon.ico|manifest.json|sw.js|register-sw.js|icon-.*\.png|\.well-known).*)",
  ]
}



// onboarding redirect
// vercel analitics
// run builds