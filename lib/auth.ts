// middleware/auth.ts
import NextAuth, { AuthOptions, Session, User, getServerSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import UserModel from "@/models/User";

import { SessionCacheService } from "@/lib/session-cache";
 
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
    };
  }
  interface AdapterUser {
    id: string;
    email: string;
    username: string;
    role: string;
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
            throw new Error("Missing credentials");
          }

          await connectDB();
          
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.usernameOrEmail.toLowerCase() },
              { username: credentials.usernameOrEmail }
            ],
          }).select('+password').maxTimeMS(10000);
          
          if (!user) {
            console.error("[Auth] User not found:", credentials.usernameOrEmail);
            throw new Error("Invalid credentials");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password as string);
          if (!isValid) {
            console.error("[Auth] Invalid password for user:", credentials.usernameOrEmail);
            throw new Error("Invalid credentials");
          }

          console.log("[Auth] Login successful for user:", user.username);
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error("[Auth] Authorization error:", error);
          throw error;
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
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.isAdmin = token.role === 'admin';
        
        // Cache session for faster lookups (optional, don't fail if it errors)
        try {
          const sessionId = `session_${token.id}`;
          SessionCacheService.set(sessionId, {
            user: session.user,
            expires: session.expires || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        } catch (e) {
          console.error('[Auth] Session cache error:', e);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
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
