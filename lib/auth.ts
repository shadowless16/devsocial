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
            console.log("[Auth] Missing credentials");
            return null;
          }

          // Retry connection up to 3 times
          let retries = 3;
          let user = null;
          
          while (retries > 0 && !user) {
            try {
              await connectDB();
              
              user = await UserModel.findOne({
                $or: [{ email: credentials.usernameOrEmail }, { username: credentials.usernameOrEmail }],
              }).maxTimeMS(5000);
              
              break;
            } catch (dbError) {
              retries--;
              console.log(`[Auth] DB connection attempt failed, retries left: ${retries}`);
              if (retries === 0) throw dbError;
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (!user) {
            console.log("[Auth] User not found:", credentials.usernameOrEmail);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log("[Auth] Invalid password for user:", credentials.usernameOrEmail);
            return null;
          }

          console.log("[Auth] Login successful for user:", user.username);
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("[Auth] Authorization error:", error.message);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // Update session only once per day
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Prevent redirect to API endpoints
      if (url.includes('/api/')) return baseUrl + "/home"
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + "/home"
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
        
        // Cache session for faster lookups
        const sessionId = `session_${token.id}`;
        SessionCacheService.set(sessionId, {
          user: session.user,
          expires: session.expires || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
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
