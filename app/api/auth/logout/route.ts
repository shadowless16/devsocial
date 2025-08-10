import type { NextRequest } from "next/server"
import { successResponse } from "@/utils/response"


export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // For JWT-based auth, logout is primarily handled client-side
  // This endpoint exists for consistency and future token blacklisting
  return successResponse({ message: "Logged out successfully" })
}
