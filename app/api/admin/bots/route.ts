import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BotAccount from '@/models/BotAccount';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const bots = await BotAccount.find().populate('userId', 'username avatar');
    return NextResponse.json({ success: true, bots });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId, personality, commentFrequency } = await req.json();
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    const bot = await BotAccount.create({ userId, personality, commentFrequency });
    return NextResponse.json({ success: true, bot });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
