import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import View from "@/models/View";
import { getSession } from '@/lib/server-auth';
import { authOptions } from "@/lib/auth";
import { handleDatabaseError } from "@/lib/api-error-handler";

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Skip tracking for temporary post IDs
    if (id.startsWith('temp-')) {
      return NextResponse.json({ success: true, message: "Temporary post, view not tracked" });
    }
    
    const session = await getSession(request);
    
    // Get IP address
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const ipAddress = ipHeader ? ipHeader.split(',')[0].trim() : 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Check if post exists
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    // Check for recent views to prevent spam (within last 5 minutes for better UX)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentViewQuery: any = {
      post: id,
      createdAt: { $gte: fiveMinutesAgo }
    };

    if (session?.user?.id) {
      recentViewQuery.user = session.user.id;
    } else {
      recentViewQuery.ipAddress = ipAddress;
    }

    const existingView = await View.findOne(recentViewQuery).lean();
    
    if (existingView) {
      console.log(`Duplicate view prevented for post ${id}`);
      return NextResponse.json({ success: true, message: "View already recorded recently", alreadyViewed: true });
    }

    // Create view data
    const viewData: any = {
      post: id,
      ipAddress,
      userAgent,
    };

    if (session?.user?.id) {
      viewData.user = session.user.id;
    }

    // Use upsert to prevent duplicate key errors
    try {
      await View.create(viewData);
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error - view already exists, just return success
        console.log(`Duplicate view prevented for post ${id}`);
        return NextResponse.json({ success: true, message: "View already recorded", alreadyViewed: true });
      }
      throw error;
    }
    // Update view count atomically
    const updatedPost = await Post.findByIdAndUpdate(
      id, 
      { $inc: { viewsCount: 1 } }, 
      { new: true, select: 'viewsCount' }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "View recorded", 
      newCount: updatedPost?.viewsCount || 0 
    });
  } catch (error: any) {
    console.error("Error recording view:", error);
    return handleDatabaseError(error);
  }
}