// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/jwt-auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully"
  });
  
  clearAuthCookie(response);
  
  return response;
}
