// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/jwt-auth";
import type { ApiResponse } from "@/types/api";

export async function POST() {
  const responseData: ApiResponse = {
    success: true,
    message: "Logged out successfully"
  };
  const response = NextResponse.json(responseData);
  
  clearAuthCookie(response);
  
  return response;
}
