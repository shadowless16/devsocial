// api/user/follow/[userId]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Follow from "@/models/Follow"
import Notification from "@/models/Notification"
import Activity from "@/models/Activity"
import { authMiddleware } from "@/middleware/auth"
import { successResponse, errorResponse } from "@/utils/response"
import { awardXP, XP_VALUES } from "@/utils/awardXP"
import MissionProgress from "@/models/MissionProgress"

// POST /api/user/follow/[userId] - Follow a user

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status || 401 })
    }

    const { userId } = await params
    const currentUserId = authResult.user.id

    if (userId === currentUserId) {
      return NextResponse.json(errorResponse("Cannot follow yourself"), { status: 400 })
    }

    const userToFollow = await User.findById(userId)
    if (!userToFollow) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: userId,
    })

    if (existingFollow) {
      return NextResponse.json(errorResponse("Already following this user"), { status: 400 })
    }

    const follow = await Follow.create({
      follower: currentUserId,
      following: userId,
    })

    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } })
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } })

    // Create a notification for the user who was followed
    await Notification.create({
      recipient: userId,
      sender: currentUserId,
      type: "follow",
      title: "New Follower",
      message: `${authResult.user.displayName || authResult.user.username} started following you`,
    })

    // Create an activity record for the user who followed
    await Activity.create({
      user: currentUserId,
      type: "user_followed",
      description: `Started following ${userToFollow.displayName || userToFollow.username}`,
      metadata: { followedUserId: userId },
      xpEarned: XP_VALUES.user_followed,
    });

    // Award XP for following a user
    await awardXP(currentUserId, "user_followed", userId)

    // Auto-track mission progress for following users
    try {
      console.log('🔍 Checking mission progress for user:', currentUserId);
      const activeMissions = await MissionProgress.find({
        user: currentUserId,
        status: "active"
      }).populate('mission');
      
      console.log('📋 Found active missions:', activeMissions.length);

      for (const progress of activeMissions) {
        if (!progress.mission) continue;
        
        const mission = progress.mission;
        console.log('🎯 Checking mission:', mission.title);
        let progressUpdated = false;
        
        for (const step of mission.steps || []) {
          const stepId = step.id || step._id?.toString();
          console.log('📝 Checking step:', step.title, 'ID:', stepId);
          console.log('✅ Already completed:', progress.stepsCompleted.includes(stepId));
          
          if (stepId && !progress.stepsCompleted.includes(stepId)) {
            // Check if this step is related to following users
            const stepText = ((step.title || '') + ' ' + (step.description || '')).toLowerCase();
            console.log('🔤 Step text:', stepText);
            const hasFollow = stepText.includes('follow');
            const hasUser = stepText.includes('user');
            const hasDeveloper = stepText.includes('developer');
            console.log('👥 Contains follow:', hasFollow, 'user:', hasUser, 'developer:', hasDeveloper);
            
            if (hasFollow && (hasUser || hasDeveloper)) {
              // Get current follow count for user
              const userFollowCount = await Follow.countDocuments({ follower: currentUserId });
              console.log('📊 Current follows:', userFollowCount, 'Target:', step.target || 1);
              
              // Check if target is met
              if (userFollowCount >= (step.target || 1)) {
                console.log('🎉 Step completed! Adding to progress');
                progress.stepsCompleted.push(stepId);
                progressUpdated = true;
              } else {
                console.log('❌ Step not completed yet. Need', (step.target || 1) - userFollowCount, 'more follows');
              }
            }
          }
        }
        
        // Check if mission is completed
        if (progress.stepsCompleted.length >= (mission.steps?.length || 0) && progress.status !== 'completed') {
          console.log('🏆 Mission completed!');
          progress.status = "completed";
          progress.completedAt = new Date();
          progress.xpEarned = mission.rewards?.xp || 0;
          progressUpdated = true;
        }
        
        if (progressUpdated) {
          console.log('💾 Saving progress update');
          await progress.save();
        }
      }
    } catch (missionError) {
      console.error('Mission progress tracking error:', missionError);
    }

    // Emit WebSocket event for real-time updates
    try {
      const io = (globalThis as any).io;
      console.log('WebSocket IO available:', !!io);
      if (io) {
        const updatedFollowedUser = await User.findById(userId);
        const updatedCurrentUser = await User.findById(currentUserId);
        
        console.log('Emitting follow_update events for follow');
        
        // Broadcast to all connected users to ensure delivery
        io.emit('follow_update', {
          userId,
          followerId: currentUserId,
          isFollowing: true,
          followersCount: updatedFollowedUser?.followersCount || 0
        });
        
        io.emit('follow_update', {
          userId: currentUserId,
          followerId: currentUserId,
          isFollowing: true,
          followersCount: updatedCurrentUser?.followersCount || 0,
          followingCount: updatedCurrentUser?.followingCount || 0
        });
      }
    } catch (error) {
      console.error('WebSocket emission error:', error);
    }

    return NextResponse.json(successResponse({ follow }))
  } catch (error) {
    console.error("Follow user error:", error)
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 })
  }
}

// DELETE /api/user/follow/[userId] - Unfollow a user
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status || 401 })
    }

    const { userId } = await params
    const currentUserId = authResult.user.id

    // Prevent unfollowing AkDavid
    const userToUnfollow = await User.findById(userId)
    if (userToUnfollow?.username === "AkDavid") {
      return NextResponse.json(errorResponse("Cannot unfollow the platform creator"), { status: 403 })
    }

    const follow = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: userId,
    })

    if (!follow) {
      return NextResponse.json(errorResponse("Not following this user"), { status: 400 })
    }

    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } })
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } })

    // Emit WebSocket event for real-time updates
    try {
      const io = (globalThis as any).io;
      console.log('WebSocket IO available for unfollow:', !!io);
      if (io) {
        const updatedUser = await User.findById(userId);
        const currentUser = await User.findById(currentUserId);
        
        console.log('Emitting follow_update events for unfollow');
        
        // Broadcast to all connected users to ensure delivery
        io.emit('follow_update', {
          userId,
          followerId: currentUserId,
          isFollowing: false,
          followersCount: updatedUser?.followersCount || 0
        });
        
        io.emit('follow_update', {
          userId: currentUserId,
          followerId: currentUserId,
          isFollowing: false,
          followersCount: currentUser?.followersCount || 0,
          followingCount: currentUser?.followingCount || 0
        });
      }
    } catch (error) {
      console.error('WebSocket emission error:', error);
    }

    return NextResponse.json(successResponse({ message: "Unfollowed successfully" }))
  } catch (error) {
    console.error("Unfollow user error:", error)
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 })
  }
}