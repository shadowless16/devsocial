// middleware/auth.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    displayName: string;
    role: string;
  };
}

export async function authMiddleware(req: NextRequest) {
  console.log("[Middleware] Protecting route:", req.nextUrl.pathname);

  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    console.log("[Middleware] Error: No valid session found.");
    return { success: false, error: "Unauthorized: Please log in.", status: 401, user: null };
  }

  console.log("[Middleware] Success: User", session.user.username, "authenticated.");
  const user = {
    id: session.user.id,
    displayName: session.user.username || session.user.email || "User",
    role: session.user.role,
  };
  
  // Attach user to the request for subsequent handlers
  (req as AuthenticatedRequest).user = user;

  return { success: true, user: user, error: null, status: 200 };
}

// Role authorization helper
export function authorizeRoles(allowedRoles: string[]) {
  return (userRole: string) => {
    return allowedRoles.includes(userRole);
  };
}
