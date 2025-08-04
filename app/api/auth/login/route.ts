// // app/api/auth/login/route.ts

// import { type NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { serialize } from "cookie";
// import connectDB from "@/lib/db";
// import User from "@/models/User";
// import { AuthService, type TokenPayload } from "@/lib/auth"; // Import AuthService and TokenPayload
// import { loginSchema } from "@/utils/validation";
// import {
//   successResponse,
//   errorResponse,
//   validationErrorResponse,
// } from "@/utils/response";

// export async function POST(request: NextRequest) {
//   try {
//     await connectDB();

//     const body = await request.json();

//     // Validate input
//     const validation = loginSchema.safeParse(body);
//     if (!validation.success) {
//       return validationErrorResponse(validation.error.format());
//     }

//     const { usernameOrEmail, password } = validation.data;

//     // Find user by username or email
//     const user = await User.findOne({
//       $or: [
//         { email: usernameOrEmail.toLowerCase() },
//         { username: usernameOrEmail },
//       ],
//     }).select("+password"); // Ensure password is selected for comparison

//     if (!user) {
//       return errorResponse("Invalid credentials", 401);
//     }

//     // Compare password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return errorResponse("Invalid credentials", 401);
//     }

//     // Update last login
//     user.lastLogin = new Date();
//     await user.save();

//     // --- START: Token Generation Logic ---
//     const tokenPayload: TokenPayload = {
//       userId: user._id.toString(),
//       email: user.email,
//       role: user.role,
//     };

//     // Generate both access and refresh tokens
//     const { accessToken, refreshToken } = AuthService.generateTokens(tokenPayload);

//     // Set the refresh token in a secure, HttpOnly cookie
//     const refreshTokenCookie = serialize("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production", // Use secure cookies in production
//       sameSite: "strict",
//       maxAge: 60 * 60 * 24 * 7, // 7 days (matches refresh token expiry)
//       path: "/",
//     });
//     // --- END: Token Generation Logic ---

//     // Return user data (excluding password)
//     const userData = {
//       id: user._id,
//       username: user.username,
//       email: user.email,
//       bio: user.bio,
//       branch: user.branch,
//       avatar: user.avatar,
//       role: user.role,
//       xp: user.xp,
//       level: user.level,
//       badges: user.badges,
//       createdAt: user.createdAt,
//       lastLogin: user.lastLogin,
//     };

//     // Create the response with the cookie
//     const response = NextResponse.json({
//         success: true,
//         message: "Login successful",
//         data: {
//             token: accessToken, // Send the short-lived accessToken
//             user: userData,
//         }
//     });

//     // Attach the cookie to the response headers
//     response.headers.set("Set-Cookie", refreshTokenCookie);

//     return response;

//   } catch (error) {
//     console.error("Login error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// app/api/auth/login/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { AuthService, type TokenPayload } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/response";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  // This log will prove if the env var is loaded. Check your server console.
  console.log("[Login Route] JWT_SECRET loaded:", !!process.env.JWT_SECRET);

  try {
    await connectDB();
    const body = await request.json();
    const { usernameOrEmail, password } = body;

    if (!usernameOrEmail || !password) {
        return errorResponse("Username/email and password are required", 400);
    }

    const user = await User.findOne({
      $or: [{ email: usernameOrEmail.toLowerCase() }, { username: usernameOrEmail }],
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse("Invalid credentials", 401);
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = AuthService.generateTokens(tokenPayload);

    const refreshTokenCookie = serialize("refreshToken", refreshToken, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Helps prevent CSRF attacks
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/", // Make the cookie available on all pages
    });

    const response = NextResponse.json(successResponse({
        token: accessToken,
        user: user.toObject(),
    }));

    response.headers.set("Set-Cookie", refreshTokenCookie);
    console.log("[Login Route] Login successful. Access token and refresh token cookie sent.");
    return response;

  } catch (error: any) {
    console.error("[Login Route] CRITICAL ERROR:", error);
    // Check for the specific JWT error
    if (error.message.includes("secretOrPrivateKey")) {
        return errorResponse("JWT Secret is not configured on the server. Please check .env.local", 500);
    }
    return errorResponse("Internal server error", 500);
  }
}