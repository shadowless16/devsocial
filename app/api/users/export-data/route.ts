import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Post from "@/models/Post";
import connectDB from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        isVerified: user.isVerified,
        isPrivate: user.isPrivate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        privacySettings: user.privacySettings,
        notificationSettings: user.notificationSettings,
        appearanceSettings: user.appearanceSettings,
      },
      posts: posts.map(post => ({
        id: post._id,
        content: post.content,
        images: post.images,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likes: post.likes?.length || 0,
        comments: post.comments?.length || 0,
        shares: post.shares?.length || 0,
        isPublic: post.isPublic,
      })),
      statistics: {
        totalPosts: posts.length,
        totalFollowers: user.followers?.length || 0,
        totalFollowing: user.following?.length || 0,
        accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      }
    };

    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}