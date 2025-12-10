// lib/server-auth.ts - Server-side auth helper to replace getServerSession
import { NextRequest } from 'next/server'
import { getUserFromRequest, getCurrentUser } from './jwt-auth'

/**
 * Get current session - replacement for getServerSession
 * Works in both API routes (with request) and Server Components (without request)
 */
export async function getSession(request?: NextRequest) {
  try {
    if (request) {
      // API route - get from request
      const user = await getUserFromRequest(request)
      if (!user) return null
      
      return {
        user: {
          id: user.userId,
          email: user.email,
          username: user.username,
          role: user.role,
        }
      }
    } else {
      // Server component - get from cookies
      const user = await getCurrentUser()
      if (!user) return null
      
      return {
        user: {
          id: user.userId,
          email: user.email,
          username: user.username,
          role: user.role,
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Session error'
    console.error('[ServerAuth] Session error:', errorMessage)
    return null
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireSession(request?: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

/**
 * Require admin role
 */
export async function requireAdmin(request?: NextRequest) {
  const session = await requireSession(request)
  if (session.user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  return session
}
