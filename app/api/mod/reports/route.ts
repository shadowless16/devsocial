import { type NextRequest } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import connectDB from "@/lib/core/db"
import Report, { IReport } from "@/models/Report"
import Post from "@/models/Post"
import Comment from "@/models/Comment"
import { authMiddleware, authorizeRoles } from "@/middleware/auth"
import { successResponse, errorResponse } from "@/utils/response"

// GET /api/mod/reports - Get flagged content (Admin/Mod only)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Get reports with pagination
    const reports = await Report.find({ status })
      .populate("reporter", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get reported content details
    const reportsWithContent = await Promise.all(
      reports.map(async (report) => {
        let reportedContent = null
        const typedReport = report as unknown as IReport & { reporter: any; reportedPost: any }

        // Schema only covers Post currently
        if (typedReport.reportedPost) {
           reportedContent = await Post.findById(typedReport.reportedPost)
            .populate("author", "username avatar level")
            .lean()
        }

        return {
          id: typedReport._id,
          reporter: {
            username: typedReport.reporter?.username,
            avatar: typedReport.reporter?.avatar,
          },
          reportedItemType: 'post', // Hardcoded as schema implies only posts
          reportedItemId: typedReport.reportedPost,
          reason: typedReport.reason,
          status: typedReport.status,
          createdAt: typedReport.createdAt,
          reportedContent,
        }
      }),
    )

    const totalReports = await Report.countDocuments({ status })
    const totalPages = Math.ceil(totalReports / limit)

    return successResponse({
      reports: reportsWithContent,
      pagination: {
        currentPage: page,
        totalPages,
        totalReports,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Get reports error:", errorMessage)
    return errorResponse("Internal server error", 500)
  }
}
