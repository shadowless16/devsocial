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

    // Update last login
    user.lastLogin = new Date();
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
      displayName: user.displayName || `${user.username}`
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
