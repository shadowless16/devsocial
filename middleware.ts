import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { apiRateLimiter, authRateLimiter } from "@/middleware/rate-limit"

export default withAuth(
  function middleware(req: NextRequest) {
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
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public access to auth pages and API routes
        if (req.nextUrl.pathname.startsWith('/auth') || 
            req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname.startsWith('/api/affiliations')) {
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (well-known URIs)
     */
    "/((?!api/auth|api/affiliations|auth|_next/static|_next/image|favicon.ico|\.well-known).*)",
  ]
}
