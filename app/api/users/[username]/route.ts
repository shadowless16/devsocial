// app/api/users/[username]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/server-auth';
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Post from "@/models/Post";
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
    
    const { username } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'profile';
    
    if (!username) {
      return NextResponse.json(
        errorResponse("Username is required"),
        { status: 400 }
      );
    }

    // Get current session (if authenticated)
    const session = await getSession(req);
    const currentUserId = session?.user?.id;

    // Find user by username (case-insensitive)
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    })
    .select("-password -email")
    .lean() as any;

    if (!user) {
      return NextResponse.json(
        errorResponse("User not found"),
        { status: 404 }
      );
    }

    // Get user statistics using aggregation
    const [
      postsCount,
      followersCount,
      followingCount,
      totalLikes,
      totalComments
    ] = await Promise.all([
      // Total posts count
      Post.countDocuments({ author: user._id }),
      
      // Followers count
      Follow.countDocuments({ following: user._id }),
      
      // Following count
      Follow.countDocuments({ follower: user._id }),
      
      // Total likes received on posts
      Post.aggregate([
        { $match: { author: user._id } },
        { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } }
      ]).then(result => result[0]?.totalLikes || 0),
      
      // Total comments on user's posts
      Post.aggregate([
        { $match: { author: user._id } },
        { $group: { _id: null, totalComments: { $sum: "$commentsCount" } } }
      ]).then(result => result[0]?.totalComments || 0)
    ]);

    // Get recent posts
    const recentPosts = await Post.find({ author: user._id })
      .populate("author", "username displayName avatar level")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Transform posts to include necessary fields
    const transformedPosts = recentPosts.map((post: any) => ({
      ...post,
      _id: post._id.toString(),
      id: post._id.toString(),
      isLiked: false, // Will be updated if user is authenticated
      likesCount: post.likesCount || post.likes?.length || 0,
      commentsCount: post.commentsCount || 0,
      createdAt: new Date(post.createdAt).toISOString()
    }));

    // Check if current user follows this user (if authenticated)
    let isFollowing = false;
    if (currentUserId && currentUserId !== user._id.toString()) {
      const followExists = await Follow.findOne({
        follower: currentUserId,
        following: user._id
      });
      isFollowing = !!followExists;
    }

    // Handle different query types
    if (type === 'stats') {
      return NextResponse.json({
        success: true,
        data: {
          totalPosts: postsCount,
          totalLikes,
          totalFollowers: followersCount,
          totalFollowing: followingCount,
          level: user.level || 1,
          xp: user.points || 0,
          badges: user.badges || []
        }
      });
    }

    if (type === 'activity') {
      // Check liked status for posts if user is authenticated
      if (currentUserId) {
        const likedPostIds = await Post.find({
          _id: { $in: transformedPosts.map(p => p._id) },
          likes: currentUserId
        }).distinct('_id');
        
        const likedPostIdsSet = new Set(likedPostIds.map(id => id.toString()));
        transformedPosts.forEach(post => {
          post.isLiked = likedPostIdsSet.has(post._id);
        });
      }

      return NextResponse.json({
        success: true,
        data: { posts: transformedPosts }
      });
    }

    // Default profile response
    // Check liked status for posts if user is authenticated
    if (currentUserId) {
      const likedPostIds = await Post.find({
        _id: { $in: transformedPosts.map(p => p._id) },
        likes: currentUserId
      }).distinct('_id');
      
      const likedPostIdsSet = new Set(likedPostIds.map(id => id.toString()));
      transformedPosts.forEach(post => {
        post.isLiked = likedPostIdsSet.has(post._id);
      });
    }

    // Calculate rank (simple ranking based on total XP)
    const userRank = await User.countDocuments({ 
      points: { $gt: user.points || 0 } 
    }) + 1;

    // Determine rank title based on level
    const getRankTitle = (level: number) => {
      if (level >= 50) return "Legend";
      if (level >= 40) return "Master";
      if (level >= 30) return "Expert";
      if (level >= 20) return "Advanced";
      if (level >= 10) return "Intermediate";
      if (level >= 5) return "Beginner";
      return "Novice";
    };

    // Prepare user profile response
    const userProfile = {
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName || user.username,
      bio: user.bio || "",
      affiliation: user.affiliation || user.branch || "Not specified",
      avatar: user.avatar || "/placeholder.svg",
      bannerUrl: user.bannerUrl || "",
      level: user.level || 1,
      points: user.points || 0,
      location: user.location || "",
      website: user.website || "",
      createdAt: user.createdAt,
      followersCount,
      followingCount,
      isFollowing,
      rank: userRank,
      rankTitle: getRankTitle(user.level || 1),
      stats: {
        totalPosts: postsCount,
        totalComments,
        totalLikes
      },
      recentPosts: transformedPosts
    };

    return NextResponse.json({
      success: true,
      data: { user: userProfile }
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      errorResponse("Failed to fetch user profile"),
      { status: 500 }
    );
  }
}
