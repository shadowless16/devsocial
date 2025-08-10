import type { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Report from "@/models/Report"
import { authMiddleware } from "@/middleware/auth"
import { createReportSchema } from "@/utils/validation"
import { successResponse, errorResponse, validationErrorResponse } from "@/utils/response"

// POST /api/reports - Create report

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Authenticate user
    const authResult = await authMiddleware(request)
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status)
    }

    const body = await request.json()

    // Validate input
    const validation = createReportSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.format())
    }

    const { reportedItemType, reportedItemId, reason } = validation.data

    // Create report
    const report = await Report.create({
      reporter: authResult.user!.id,
      reportedItemType,
      reportedItemId,
      reason,
    })

    return successResponse(report, 201)
  } catch (error) {
    console.error("Create report error:", error)
    return errorResponse("Internal server error", 500)
  }
}
