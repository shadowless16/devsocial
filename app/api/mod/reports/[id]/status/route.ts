import type { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Report from "@/models/Report"
import { authMiddleware, authorizeRoles } from "@/middleware/auth"
import { successResponse, errorResponse } from "@/utils/response"

// PATCH /api/mod/reports/[id]/status - Update report status

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    // Authenticate user
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return errorResponse(authResult.error, authResult.status || 401)
    }

    // Check if user has moderator/admin role
    if (!authorizeRoles(["admin", "moderator"])(authResult.user.role || '')) {
      return errorResponse("Not authorized", 403)
    }

    const body = await request.json()
    const { status } = body

    if (!["pending", "resolved", "dismissed"].includes(status)) {
      return errorResponse("Invalid status", 400)
    }

    // Update report status
    const updatedReport = await Report.findByIdAndUpdate(params.id, { status }, { new: true, runValidators: true })

    if (!updatedReport) {
      return errorResponse("Report not found", 404)
    }

    return successResponse(updatedReport)
  } catch (error) {
    console.error("Update report status error:", error)
    return errorResponse("Internal server error", 500)
  }
}
