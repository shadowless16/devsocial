// app/api/users/[username]/following/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/server-auth';
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Follow from "@/models/Follow";
import connectDB from "@/lib/db";
import { successResponse, errorResponse } from "@/utils/response";

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await connectDB();
    
  // `params` can be a Promise in Next.js route handlers — await it before using.
  const { username } = await params;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    
    if (!username) {
      return NextResponse.json(
        errorResponse("Username is required"),
        { status: 400 }
      );
    }

    // Find user by username
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    }).select("_id username");

    if (!user) {
      return NextResponse.json(
        errorResponse("User not found"),
        { status: 404 }
      );
    }

    // Get following with user details
    const followingData = await Follow.find({ follower: user._id })
      .populate("following", "username displayName firstName lastName avatar level bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalFollowing = await Follow.countDocuments({ follower: user._id });

    // Transform the data
    const following = followingData
      .filter((follow: any) => follow.following)
      .map((follow: any) => ({
        _id: follow.following._id.toString(),
        username: follow.following.username,
        displayName: follow.following.displayName || 
                    (follow.following.firstName && follow.following.lastName 
                      ? `${follow.following.firstName} ${follow.following.lastName}` 
                      : follow.following.username),
        avatar: follow.following.avatar || "/placeholder.svg",
        level: follow.following.level || 1,
        bio: follow.following.bio || "",
        followedAt: follow.createdAt
      }));

    const responseData = {
      following,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFollowing / limit),
        totalCount: totalFollowing,
        hasMore: skip + following.length < totalFollowing
      }
    };
    
    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json(
      errorResponse("Failed to fetch following"),
      { status: 500 }
    );
  }
}
