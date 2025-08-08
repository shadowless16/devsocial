import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { apiRateLimiter, authRateLimiter } from "@/middleware/rate-limit"

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

    // If user is authenticated and tries to access auth pages, redirect appropriately
    if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
      // Let the client-side handle the onboarding check
      return NextResponse.redirect(new URL('/', req.url))
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
        // Allow public access to auth pages and API routes
        if (req.nextUrl.pathname.startsWith('/auth') || 
            req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname.startsWith('/api/affiliations') ||
            req.nextUrl.pathname === '/onboarding') {
          return true;
        }
        // For protected routes, require a token
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
     * - api/auth (NextAuth API routes)
     * - api/affiliations (public affiliations data)
     * - auth (login/signup pages)
     * - onboarding (onboarding page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (well-known URIs)
     */
    "/((?!api/auth|api/affiliations|auth|onboarding|_next/static|_next/image|favicon.ico|\.well-known).*)",
  ]
}



// onboarding redirect
// vercel analitics
// run builds