// lib/auth.ts
import NextAuth, { AuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

// Removed Mongoose model and connectDB imports to reduce frontend load time
 
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    username: string;
    role: string;
  }
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      isAdmin: boolean;
      accessToken?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    username?: string;
    accessToken?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.usernameOrEmail || !credentials?.password) {
            console.error("[Auth] Missing credentials");
            return null;
          }

          const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
          
          const response = await fetch(`${backendUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.usernameOrEmail, // The backend login expects 'email' or handles both?
              password: credentials.password,
            }),
          });

          const data = await response.json();
          
          if (!response.ok || !data.success) {
            console.error("[Auth] Backend login failed:", data.message || data.error);
            return null;
          }

          console.log("[Auth] Login successful via backend for user:", data.user.username);
          return {
            id: data.user.id.toString(),
            email: data.user.email,
            username: data.user.username,
            role: data.user.role || 'user',
            accessToken: data.token, // Store the JWT here
          } as any;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Operation failed';
          console.error("[Auth] Authorization error calling backend:", errorMessage);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session only once per day
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const base = process.env.NEXTAUTH_URL || baseUrl;
      
      // Prevent redirect to API, auth pages, or root
      if (url.includes('/api/') || url.includes('/auth/') || url === '/' || url === base || url === baseUrl) {
        return base + "/home";
      }
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        // Don't redirect to auth pages
        if (url.startsWith("/auth/")) {
          return base + "/home";
        }
        return `${base}${url}`;
      }
      
      // Handle absolute URLs on same origin
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(base);
        
        // Prevent auth page redirects
        if (urlObj.pathname.startsWith('/auth/')) {
          return base + "/home";
        }
        
        if (urlObj.origin === baseObj.origin) {
          return url;
        }
      } catch (e) {
        console.error('[Auth] Invalid URL in redirect:', e);
      }
      
      return base + "/home";
    },
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.isAdmin = token.role === 'admin';
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'devsocial-nextauth-secret-2024-production-key',
  debug: true, // Enable debug to see JWT errors
};

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export const auth = NextAuth(authOptions);

// Utility functions for auth
export class AuthService {
  // Generate password reset token
  static generateResetToken() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  // Send password reset email (placeholder implementation)
  static async sendPasswordResetEmail(email: string, resetToken: string, username: string) {
    console.log(`[AuthService] Password reset email would be sent to ${email}`);
    console.log(`[AuthService] Reset token: ${resetToken}`);
    console.log(`[AuthService] Username: ${username}`);
    
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    console.log(`[AuthService] Reset link: ${resetLink}`);
    
    // TODO: Implement actual email sending
    return true;
  }
}
