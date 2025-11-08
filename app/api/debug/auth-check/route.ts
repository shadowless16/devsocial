import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

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
    } catch (error: any) {
      dbError = error.message;
    }

    return NextResponse.json({
      envVars: checks,
      database: {
        connected: dbConnected,
        error: dbError,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
