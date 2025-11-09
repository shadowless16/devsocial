// middleware/auth.ts - JWT-based authentication helper (replaces getServerSession)
import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt-auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    username: string
    role?: string
    displayName?: string
  }
}

type AuthResult = 
  | { success: true; user: { id: string; email: string; username: string; role?: string; displayName?: string } }
  | { success: false; error: string; status?: number }

/**
 * Main authentication middleware - replaces getServerSession
 * Use this in API routes to authenticate requests
 */
export async function authMiddleware(request: NextRequest): Promise<AuthResult> {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user?.userId) {
      return { success: false, error: 'Unauthorized', status: 401 }
    }

    return { 
      success: true, 
      user: {
        id: user.userId,
        email: user.email || '',
        username: user.username,
        role: user.role,
        displayName: user.username
      }
    }
  } catch (error) {
    return { success: false, error: 'Authentication failed', status: 401 }
  }
}

// Helper function for role-based authorization
export function authorizeRoles(allowedRoles: string[]) {
  return (userRole: string) => allowedRoles.includes(userRole)
}