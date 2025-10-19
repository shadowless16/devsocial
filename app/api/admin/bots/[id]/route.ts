import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BotAccount from '@/models/BotAccount';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    await BotAccount.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const updates = await req.json();
    const bot = await BotAccount.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json({ success: true, bot });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
