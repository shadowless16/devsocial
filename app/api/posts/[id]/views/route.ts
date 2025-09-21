import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import View from "@/models/View";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Get IP address
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const ipAddress = ipHeader ? ipHeader.split(',')[0].trim() : 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Check if post exists
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    // Check for recent views to prevent spam (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentViewQuery: any = {
      post: id,
      createdAt: { $gte: oneHourAgo }
    };

    if (session?.user?.id) {
      recentViewQuery.user = session.user.id;
    } else {
      recentViewQuery.ipAddress = ipAddress;
    }

    const existingView = await View.findOne(recentViewQuery);
    
    if (existingView) {
      console.log(`Recent view found for post ${id}, not counting again`);
      return NextResponse.json({ success: true, message: "View already recorded recently" });
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

    // Create new view record and increment count
    await View.create(viewData);
    await Post.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
    
    console.log(`New view recorded and count incremented for post ${id}`);
    return NextResponse.json({ success: true, message: "View recorded" });
  } catch (error) {
    console.error("Error recording view:", error);
    return NextResponse.json({ success: false, message: "Failed to record view" }, { status: 500 });
  }
}