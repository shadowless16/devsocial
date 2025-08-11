import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Direct database access without MCP client
const UserSchema = new mongoose.Schema({
  username: String,
  displayName: String,
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  avatar: String,
  role: { type: String, default: 'user' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(request: NextRequest) {
  try {
    const { tool, args } = await request.json();

    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial');
    }

    let result;
    switch (tool) {
      case 'get_leaderboard':
        const topUsers = await User.find()
          .sort({ points: -1 })
          .limit(args.limit || 10)
          .select('username displayName points level avatar')
          .lean();
        result = topUsers;
        break;
      default:
        return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}