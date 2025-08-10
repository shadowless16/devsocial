import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Follow from "@/models/Follow";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const username = url.searchParams.get("username");
    
    if (!username) {
      return NextResponse.json(
        errorResponse("Username parameter required"),
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    }).select("_id username displayName");

    if (!user) {
      return NextResponse.json(
        errorResponse("User not found"),
        { status: 404 }
      );
    }

    // Get all follows for this user
    const followers = await Follow.find({ following: user._id })
      .populate("follower", "username displayName firstName lastName")
      .lean();
      
    const following = await Follow.find({ follower: user._id })
      .populate("following", "username displayName firstName lastName")
      .lean();

    // Get total counts
    const totalFollows = await Follow.countDocuments();
    const userFollowersCount = await Follow.countDocuments({ following: user._id });
    const userFollowingCount = await Follow.countDocuments({ follower: user._id });

    return NextResponse.json(
      successResponse({
        user: {
          _id: user._id,
          username: user.username,
          displayName: user.displayName
        },
        followers: followers.map(f => ({
          _id: f.follower?._id,
          username: f.follower?.username,
          displayName: f.follower?.displayName || f.follower?.username,
          createdAt: f.createdAt
        })),
        following: following.map(f => ({
          _id: f.following?._id,
          username: f.following?.username,
          displayName: f.following?.displayName || f.following?.username,
          createdAt: f.createdAt
        })),
        stats: {
          totalFollowsInDB: totalFollows,
          userFollowersCount,
          userFollowingCount
        }
      })
    );

  } catch (error) {
    console.error("Debug follows error:", error);
    return NextResponse.json(
      errorResponse("Failed to fetch debug data"),
      { status: 500 }
    );
  }
}