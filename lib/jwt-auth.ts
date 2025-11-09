// lib/jwt-auth.ts - Pure JWT Authentication System
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// SINGLE SOURCE OF TRUTH FOR JWT SECRET
const JWT_SECRET = new TextEncoder().encode('devsocial-jwt-secret-2024-production-key')
const TOKEN_NAME = 'auth-token'
const TOKEN_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

export interface TokenPayload {
  userId: string
  email: string
  username: string
  role: string
  [key: string]: any // Index signature for JWTPayload compatibility
}

/**
 * Create a JWT token for a user
 */
export async function createToken(payload: TokenPayload): Promise<string> {
  const token = await new SignJWT({ ...payload } as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
  
  return token
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as TokenPayload
  } catch (error) {
    console.error('[JWT] Token verification failed:', error)
    return null
  }
}

/**
 * Set auth token in cookie (for API routes)
 */
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  })
  return response
}

/**
 * Clear auth cookie (for logout)
 */
export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete(TOKEN_NAME)
  return response
}

/**
 * Get token from request (for middleware/API routes)
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(TOKEN_NAME)?.value || null
}

/**
 * Get current user from token in request
 */
export async function getUserFromRequest(req: NextRequest): Promise<TokenPayload | null> {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

/**
 * Get current user from cookies (for server components)
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<TokenPayload> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
