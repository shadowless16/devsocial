// app/api/auth/login/route.ts - Pure JWT Authentication
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/core/db";
import User from "@/models/User";
import { createToken, setAuthCookie } from "@/lib/auth/jwt-auth";
import type { ApiResponse, LoginRequest, LoginResponse } from "@/types/api";
import { getErrorMessage } from "@/types/errors";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json() as LoginRequest;
    const { usernameOrEmail, password } = body;

    if (!usernameOrEmail || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Missing credentials" },
        { status: 400 }
      );
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail },
      ],
    }).select("+password");

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Calculate Login Streak
    const now = new Date();
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    let newStreak = user.loginStreak || 0;

    if (lastLogin) {
      const oneDay = 24 * 60 * 60 * 1000;
      const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
      
      // If login was more than 24h ago but less than 48h (consecutive day)
      // Actually, standard checking is checking calendar days or 24h windows. 
      // Let's use simple day difference for robustness:
      // Reset logic:
      const isSameDay = now.toDateString() === lastLogin.toDateString();
      const isYesterday = new Date(now.getTime() - oneDay).toDateString() === lastLogin.toDateString();

      if (isSameDay) {
        // Do nothing, already logged in today
      } else if (isYesterday) {
        newStreak += 1;
      } else {
        // Missed a day or more
        newStreak = 1;
      }
    } else {
      // First time login or no last login recorded
      newStreak = 1;
    }

    user.loginStreak = newStreak;
    user.lastLogin = now;
    await user.save();

    // Create JWT token
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      xp: user.points,
      level: user.level,
      badges: user.badges,
      techStack: user.techStack || [],
      points: user.points || 0,
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
      displayName: user.displayName || `${user.username}`,
      loginStreak: user.loginStreak || 1, 
    };

    // Create response with auth cookie
    const responseData: ApiResponse<LoginResponse> = {
      success: true,
      message: "Login successful",
      data: { user: userData, token, expiresIn: 30 * 24 * 60 * 60 }
    };
    const response = NextResponse.json(responseData);

    // Set auth cookie
    setAuthCookie(response, token);

    return response;

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Login error:", errorMessage);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
