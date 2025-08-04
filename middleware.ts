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
      authorized: ({ token }) => {
        // Return true if the user has a valid token
        return !!token
      },
    },
  }
)

// Protect all routes under /authenticated
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - auth (login/signup pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (well-known URIs)
     */
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|\.well-known).*)",
  ]
}
