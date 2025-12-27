// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/jwt-auth";
import connectDB from "@/lib/core/db";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getUserFromRequest(request);
    
    if (!tokenPayload) {
      return NextResponse.json({
        success: false,
        user: null
      });
    }

    // Get full user data from database
    await connectDB();
    const user = await User.findById(tokenPayload.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        user: null
      });
    }

    // Calculate Streak on Session Check (Page Refresh)
    const now = new Date();
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    let currentStreak = user.loginStreak || 0; // Use a different variable name to avoid confusion with newStreak from snippet

    let streakUpdated = false;

    if (lastLogin) {
      const oneDay = 24 * 60 * 60 * 1000;
      // Check if same day
      const isSameDay = now.toDateString() === lastLogin.toDateString();
      const isYesterday = new Date(now.getTime() - oneDay).toDateString() === lastLogin.toDateString();

      if (isSameDay) {
        // Same day, no change to streak.
        // Optionally update lastLogin to reflect last activity, but not strictly for streak.
        // user.lastLogin = now;
        // streakUpdated = true;
      } else if (isYesterday) {
        // Consecutive day, increment streak
        currentStreak += 1;
        user.lastLogin = now; // Update last interaction
        user.loginStreak = currentStreak;
        streakUpdated = true;
      } else {
        // Missed a day (more than one day passed since last login)
        currentStreak = 1; // Reset to 1 for today
        user.lastLogin = now;
        user.loginStreak = currentStreak;
        streakUpdated = true;
      }
    } else {
      // First ever login/session for this user (or lastLogin was null)
      currentStreak = 1;
      user.lastLogin = now;
      user.loginStreak = currentStreak;
      streakUpdated = true;
    }

    if (streakUpdated) {
      await user.save();
      console.log(`[Session] Streak updated for ${user.username}: ${user.loginStreak}`);
    } else if (user.loginStreak === 0) {
      // Fix for legacy users with 0 streak
      user.loginStreak = 1;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        points: user.points,
        xp: user.points,
        level: user.level,
        badges: user.badges,
        loginStreak: user.loginStreak || 1, 
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Session error:", errorMessage);
    return NextResponse.json({
      success: false,
      user: null
    });
  }
}
