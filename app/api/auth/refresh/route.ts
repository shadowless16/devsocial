// // app/api/auth/refresh/route.ts
// import { NextResponse, type NextRequest } from "next/server";
// import { AuthService } from "@/lib/auth";
// import User, { type IUser } from "@/models/User";
// import connectDB from "@/lib/db";
// import { successResponse, errorResponse } from "@/utils/response";

// export async function POST(req: NextRequest) {
//   try {
//     const { refreshToken } = await req.json();
//     if (!refreshToken) return errorResponse("Refresh token is required.", 400);

//     await connectDB();

//     const payload = AuthService.verifyRefreshToken(refreshToken);
//     if (!payload) return errorResponse("Invalid or expired refresh token.", 401);

//     const user: IUser | null = await User.findById(payload.userId);
//     if (!user) return errorResponse("User not found.", 401);

//     // --- FIX: Cast the user._id to string to satisfy TypeScript ---
//     const tokens = AuthService.generateTokens({
//       userId: user._id.toString(),
//       email: user.email,
//       role: user.role,
//     });
    
//     return NextResponse.json(successResponse({ accessToken: tokens.accessToken }));

//   } catch (error: any) {
//     console.error("[API_REFRESH_ERROR]", error);
//     return errorResponse("An error occurred while refreshing the token.", 500);
//   }
// }