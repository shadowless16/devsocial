// Authentication and Authorization Types

// ============= User Roles =============

export type UserRole = 'user' | 'moderator' | 'admin'

export type Gender = 'male' | 'female' | 'other'

// ============= JWT Types =============

export interface JWTPayload {
  userId: string
  email: string
  username: string
  role: UserRole
  iat?: number
  exp?: number
}

export interface DecodedToken extends JWTPayload {
  iat: number
  exp: number
}

// ============= Session Types =============

export interface SessionUser {
  id: string
  email: string
  username: string
  displayName: string
  avatar: string
  role: UserRole
  level: number
  xp: number
  isPremium?: boolean
}

export interface Session {
  user: SessionUser
  expires: string
}

export interface AuthSession {
  user: {
    id: string
    email: string
    username: string
    role: UserRole
  }
}

// ============= Credential Types =============

export interface LoginCredentials {
  usernameOrEmail: string
  password: string
}

export interface SignupCredentials {
  username: string
  email: string
  password: string
  displayName: string
}

export interface PasswordResetCredentials {
  token: string
  password: string
}

// ============= Auth Context Types =============

export interface AuthContextValue {
  user: SessionUser | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<SessionUser>) => void
  refreshSession: () => Promise<void>
}

// ============= Auth Error Types =============

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export interface AuthErrorResponse {
  error: string
  code: string
  statusCode: number
}

// ============= Permission Types =============

export interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
}

export type PermissionCheck = (user: SessionUser, permission: Permission) => boolean

// ============= OAuth Types =============

export interface OAuthProvider {
  id: string
  name: string
  type: 'oauth'
}

export interface OAuthProfile {
  id: string
  email: string
  name: string
  image?: string
}

// ============= Token Types =============

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshTokenPayload {
  userId: string
  tokenId: string
}

// ============= Verification Types =============

export interface EmailVerificationToken {
  userId: string
  token: string
  expiresAt: Date
}

export interface PasswordResetToken {
  userId: string
  token: string
  expiresAt: Date
}
