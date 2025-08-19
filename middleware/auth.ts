import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Unauthorized', status: 401 }
  }

  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret') as any
    return { success: true, user: decoded }
  } catch (error) {
    return { success: false, error: 'Invalid token', status: 401 }
  }
}

// Helper function for role-based authorization
export function authorizeRoles(allowedRoles: string[]) {
  return (userRole: string) => allowedRoles.includes(userRole)
}