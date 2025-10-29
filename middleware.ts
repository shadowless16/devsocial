import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { apiRateLimiter, authRateLimiter } from "@/middleware/rate-limit"

const isDev = process.env.NODE_ENV === 'development'
const shouldLog = process.env.LOG_MIDDLEWARE === 'true'

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    
    // Skip middleware for root path entirely
    if (pathname === '/') {
      return NextResponse.next()
    }
    
    // Apply rate limiting to API routes
    if (pathname.startsWith("/api")) {
      // Use stricter rate limiting for auth endpoints
      if (pathname.startsWith("/api/auth/login") || 
          pathname.startsWith("/api/auth/signup")) {
        const rateLimitResponse = authRateLimiter(req);
        if (rateLimitResponse) return rateLimitResponse;
      } else {
        const rateLimitResponse = apiRateLimiter(req);
        if (rateLimitResponse) return rateLimitResponse;
      }
    }

    // Handle onboarding redirects for authenticated users
    const token = await getToken({ req })

    // If user is authenticated and tries to access auth pages, redirect to home
    if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
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
        
        // Allow public access to root, auth pages, onboarding, and trending
        if (pathname === '/' || pathname.startsWith('/auth') || pathname === '/onboarding' || pathname.startsWith('/trending')) {
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

// Protect authenticated routes only
export const config = {
  matcher: [
    '/home/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/leaderboard/:path*',
    '/challenges/:path*',
    '/projects/:path*',
    '/communities/:path*',
    '/community/:path*',
    '/missions/:path*',
    '/referrals/:path*',
    '/feedback/:path*',
    '/search/:path*',
    '/post/:path*',
    '/tag/:path*',
    '/confess/:path*',
    '/moderation/:path*',
    '/admin/:path*',
    '/admin-roles/:path*',
    '/career-paths/:path*',
    '/knowledge-bank/:path*',
    '/create-community/:path*',
  ]
}



// onboarding redirect
// vercel analitics
// run builds