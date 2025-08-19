import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

export async function authMiddleware(request: NextRequest): Promise<AuthResult> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized', status: 401 }
    }

    return { 
      success: true, 
      user: {
        id: session.user.id,
        email: session.user.email || '',
        username: session.user.username,
        role: session.user.role,
        displayName: session.user.username
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