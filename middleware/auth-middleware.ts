
// // middleware/auth-middleware.ts
// import { type NextRequest, NextResponse } from "next/server";
// import { AuthService } from "@/lib/auth";
// import User from "@/models/User";
// import connectDB from "@/lib/db";

// export interface AuthenticatedRequest extends NextRequest {
//   user: {
//     id: string;
//     username: string;
//     email: string;
//     role: string;
//   };
// }

// // This is a higher-order function that protects API routes.
// export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
//   return async (req: NextRequest) => {
//     console.log(`[Middleware] Protecting route: ${req.nextUrl.pathname}`);
//     const authHeader = req.headers.get("authorization");

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       console.log("[Middleware] Failed: No token provided.");
//       return NextResponse.json({ success: false, message: "Authentication token required." }, { status: 401 });
//     }

//     const token = authHeader.substring(7);
//     const payload = AuthService.verifyAccessToken(token);

//     if (!payload) {
//       console.log("[Middleware] Failed: Invalid or expired access token.");
//       return NextResponse.json({ success: false, message: "Invalid or expired token." }, { status: 401 });
//     }

//     // Optional: Check if user exists in DB on every request.
//     // This adds security but also a database call.
//     await connectDB();
//     const user = await User.findById(payload.userId).lean();
//     if (!user) {
//         console.log(`[Middleware] Failed: User with ID ${payload.userId} not found.`);
//         return NextResponse.json({ success: false, message: "User not found." }, { status: 401 });
//     }

//     console.log(`[Middleware] Success: User ${user.username} authenticated.`);
    
//     // Attach user to the request and proceed to the handler
//     const authenticatedReq = req as AuthenticatedRequest;
//     authenticatedReq.user = {
//       id: user._id.toString(),
//       username: user.username,
//       email: user.email,
//       role: user.role,
//     };

//     return handler(authenticatedReq);
//   };
// }

// middleware/auth-middleware.ts
import { getUserFromRequest } from '@/lib/jwt-auth';
import { NextResponse, type NextRequest } from "next/server";
;

// Extend the Session type to include custom user fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      isAdmin: boolean;
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
    const user = await getUserFromRequest(req);
    if (!session || !session.user) {
      console.log("[Middleware] Failed: No session found.");
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = {
      id: user.userId,
      username: user.username,
      email: user.email || "",
      role: user.role,
    };

    console.log(`[Middleware] Success: User ${user.username} authenticated.`);
    return handler(authenticatedReq);
  };
}