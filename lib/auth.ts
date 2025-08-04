// middleware/auth.ts
import { getServerSession } from "next-auth/next";
import { NextResponse, type NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
  }
}

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    console.log(`[Middleware] Protecting route: ${req.nextUrl.pathname}`);
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log("[Middleware] Failed: No session found.");
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email || "",
      role: session.user.role,
    };

    console.log(`[Middleware] Success: User ${session.user.username} authenticated.`);
    return handler(authenticatedReq);
  };
}

// Token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Auth service for JWT token management and email services
export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret";
  private static JWT_EXPIRES_IN = "15m"; // Access token expires in 15 minutes
  private static REFRESH_TOKEN_EXPIRES_IN = "7d"; // Refresh token expires in 7 days

  // Generate both access and refresh tokens
  static generateTokens(payload: TokenPayload) {
    const jwt = require('jsonwebtoken');
    
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  static verifyToken(token: string) {
    const jwt = require('jsonwebtoken');
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Generate password reset token
  static generateResetToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  // Send password reset email (placeholder implementation)
  static async sendPasswordResetEmail(email: string, resetToken: string, username: string) {
    // In a real application, you would integrate with an email service like SendGrid, Nodemailer, etc.
    console.log(`[AuthService] Password reset email would be sent to ${email}`);
    console.log(`[AuthService] Reset token: ${resetToken}`);
    console.log(`[AuthService] Username: ${username}`);
    
    // For now, we'll just log the reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    console.log(`[AuthService] Reset link: ${resetLink}`);
    
    // TODO: Implement actual email sending
    // Example with nodemailer:
    // const transporter = createTransporter();
    // await transporter.sendMail({
    //   to: email,
    //   subject: 'Password Reset Request',
    //   html: `<p>Hi ${username}, click <a href="${resetLink}">here</a> to reset your password.</p>`
    // });
    
    return true;
  }
}
