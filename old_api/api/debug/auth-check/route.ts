import { NextResponse } from 'next/server';
import connectDB from '@/lib/core/db';

export async function GET() {
  try {
    const checks = {
      nextauthUrl: !!process.env.NEXTAUTH_URL,
      nextauthSecret: !!process.env.NEXTAUTH_SECRET,
      mongodbUri: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV,
    };

    let dbConnected = false;
    let dbError = null;
    
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dbError = errorMessage;
    }

    return NextResponse.json({
      envVars: checks,
      database: {
        connected: dbConnected,
        error: dbError,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: errorMessage,
    }, { status: 500 });
  }
}
