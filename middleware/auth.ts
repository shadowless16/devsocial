// middleware/auth.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    return { success: false, message: "Unauthorized: Please log in.", user: null };
  }

  console.log("[Middleware] Success: User", session.user.username, "authenticated.");
  (req as AuthenticatedRequest).user = {
    id: session.user.id,
    displayName: session.user.username || session.user.email || "User",
    role: session.user.role,
  };

  return { success: true, user: (req as AuthenticatedRequest).user };
}

// Role authorization helper
export function authorizeRoles(allowedRoles: string[]) {
  return (userRole: string) => {
    return allowedRoles.includes(userRole);
  };
}
