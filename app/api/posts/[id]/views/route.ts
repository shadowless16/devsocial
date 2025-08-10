import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import View from "@/models/View";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const session = await getServerSession(authOptions);
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Check if post exists
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    // Try to create a new view record
    try {
      const viewData: any = {
        post: id,
        ipAddress,
        userAgent,
      };

      if (session?.user?.id) {
        viewData.user = session.user.id;
      }

      await View.create(viewData);
      
      // Increment view count on post
      await Post.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
      
      return NextResponse.json({ success: true, message: "View recorded" });
    } catch (error: any) {
      // If it's a duplicate key error, the view was already recorded
      if (error.code === 11000) {
        return NextResponse.json({ success: true, message: "View already recorded" });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error recording view:", error);
    return NextResponse.json({ success: false, message: "Failed to record view" }, { status: 500 });
  }
}