import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/auth/server-auth';
import User from "@/models/User";
import Post from "@/models/Post";
import connectDB from "@/lib/core/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get user data
    const user = await User.findById(session.user.id).select("-password");
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get user's posts
    const posts = await Post.find({ author: session.user.id });

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        website: user.website,
        avatar: user.avatar,
        bannerUrl: user.bannerUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        privacySettings: user.privacySettings,
        appearanceSettings: user.appearanceSettings,
      },
      posts: posts.map(post => ({
        id: post._id,
        content: post.content,
        imageUrls: post.imageUrls,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        viewsCount: post.viewsCount || 0,
      })),
      statistics: {
        totalPosts: posts.length,
        totalFollowers: user.followersCount || 0,
        totalFollowing: user.followingCount || 0,
        accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      }
    };

    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error exporting user data:", errorMessage);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
