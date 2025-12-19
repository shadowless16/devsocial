import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Redirect root to login if not authenticated
  if (pathname === '/') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'devsocial-nextauth-secret-2024-production-key' })
    console.log('[Middleware] Root path - User:', !!token)
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    return NextResponse.redirect(new URL('/home', req.url))
  }
  
  // Apply rate limiting to API routes (only if the rate limiter exists)
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    // Basic rate limit check can be added here if needed, 
    // but we'll focus on fixing the auth slowness first.
  }

  // Public routes - allow access
  const publicPaths = ['/', '/auth', '/trending', '/onboarding']
  const isPublic = publicPaths.some(path => pathname.startsWith(path))
  
  if (isPublic) {
    return NextResponse.next()
  }

  // Protected routes - require authentication
  const protectedPaths = ['/home', '/dashboard', '/profile', '/settings', '/messages', '/notifications', 
    '/leaderboard', '/challenges', '/projects', '/communities', '/community', '/missions', 
    '/referrals', '/feedback', '/search', '/post', '/tag', '/confess', '/moderation', 
    '/admin', '/admin-roles', '/career-paths', '/knowledge-bank', '/create-community']
  
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtected) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'devsocial-nextauth-secret-2024-production-key' })
    
    console.log('[Middleware] Protected route:', pathname, 'User:', token ? token.username : 'none')
    
    if (!token) {
      console.log('[Middleware] Redirecting to login')
      const url = new URL('/auth/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Protect authenticated routes only
export const config = {
  matcher: [
    '/',
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