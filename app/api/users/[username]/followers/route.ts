// app/api/users/[username]/followers/route.ts
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

    // Get followers with user details
    const followersData = await Follow.find({ following: user._id })
      .populate("follower", "username displayName firstName lastName avatar level bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalFollowers = await Follow.countDocuments({ following: user._id });

    // Transform the data
    const followers = followersData
      .filter((follow: any) => follow.follower)
      .map((follow: any) => ({
        _id: follow.follower._id.toString(),
        username: follow.follower.username,
        displayName: follow.follower.displayName || 
                    (follow.follower.firstName && follow.follower.lastName 
                      ? `${follow.follower.firstName} ${follow.follower.lastName}` 
                      : follow.follower.username),
        avatar: follow.follower.avatar || "/placeholder.svg",
        level: follow.follower.level || 1,
        bio: follow.follower.bio || "",
        followedAt: follow.createdAt
      }));

    const responseData = {
      followers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFollowers / limit),
        totalCount: totalFollowers,
        hasMore: skip + followers.length < totalFollowers
      }
    };
    
    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      errorResponse("Failed to fetch followers"),
      { status: 500 }
    );
  }
}
