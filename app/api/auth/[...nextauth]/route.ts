// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const handler = NextAuth(authOptions);

const wrappedHandler = async (req: NextRequest) => {
  try {
    return await handler(req as any);
  } catch (error) {
    console.error('[NextAuth] Handler error:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
};

export { wrappedHandler as GET, wrappedHandler as POST };
