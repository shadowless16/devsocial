import { connectWithRetry } from '@/lib/core/connect-with-retry'
import User from '@/models/User'
import Notification from '@/models/Notification'
import LeaderboardSnapshot from '@/models/LeaderboardSnapshot'
import { XPOvertakeService } from '@/utils/xp-overtake-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    await connectWithRetry()

    if (action === 'setup') {
      const userA = await User.findOneAndUpdate(
        { username: 'testuser_a' },
        { 
          username: 'testuser_a',
          email: 'testusera@test.com',
          password: 'test123',
          points: 1000
        },
        { upsert: true, new: true }
      )

      const userB = await User.findOneAndUpdate(
        { username: 'testuser_b' },
        { 
          username: 'testuser_b',
          email: 'testuserb@test.com',
          password: 'test123',
          points: 950
        },
        { upsert: true, new: true }
      )

      await LeaderboardSnapshot.deleteMany({})
      await LeaderboardSnapshot.insertMany([
        { userId: userA._id, rank: 1, totalXP: 1000, type: 'all-time' },
        { userId: userB._id, rank: 2, totalXP: 950, type: 'all-time' }
      ])

      return NextResponse.json({
        success: true,
        message: 'Test users created',
        users: {
          userA: { username: userA.username, points: userA.points },
          userB: { username: userB.username, points: userB.points }
        }
      })
    }

    if (action === 'overtake') {
      const userB = await User.findOneAndUpdate(
        { username: 'testuser_b' },
        { points: 1010 },
        { new: true }
      )

      if (!userB) {
        return NextResponse.json({ error: 'User B not found. Run setup first.' }, { status: 404 })
      }

      const result = await XPOvertakeService.checkAndNotifyOvertakes('all-time')

      const notifications = await Notification.find({
        type: { $in: ['xp_overtake', 'xp_overtaken'] }
      }).sort({ createdAt: -1 }).limit(10).populate('recipient sender', 'username')

      return NextResponse.json({
        success: true,
        overtakes: result.overtakes,
        userB: { username: userB.username, points: userB.points },
        notifications: notifications.map(n => {
          const recipient = n.recipient as unknown as { username: string };
          const sender = n.sender as unknown as { username: string };
          return {
            recipient: recipient?.username || 'Unknown',
            sender: sender?.username || 'Unknown',
            type: n.type,
            message: n.message
          };
        })
      })
    }

    if (action === 'cleanup') {
      await User.deleteMany({ username: { $in: ['testuser_a', 'testuser_b'] } })
      await Notification.deleteMany({ 
        type: { $in: ['xp_overtake', 'xp_overtaken'] }
      })
      await LeaderboardSnapshot.deleteMany({})

      return NextResponse.json({
        success: true,
        message: 'Test data cleaned up'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Test overtake error:', errorMessage)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectWithRetry()

    const testUsers = await User.find({ 
      username: { $in: ['testuser_a', 'testuser_b'] } 
    }).select('username points').sort({ points: -1 })

    const notifications = await Notification.find({
      type: { $in: ['xp_overtake', 'xp_overtaken'] }
    }).sort({ createdAt: -1 }).limit(10).populate('recipient sender', 'username')

    const snapshots = await LeaderboardSnapshot.find({}).sort({ createdAt: -1 }).limit(10)

    return NextResponse.json({
      success: true,
      testUsers: testUsers.map(u => ({ username: u.username, points: u.points })),
      notifications: notifications.map(n => {
        const recipient = n.recipient as unknown as { username: string };
        const sender = n.sender as unknown as { username: string };
        return {
          recipient: recipient?.username || 'Unknown',
          sender: sender?.username || 'Unknown',
          type: n.type,
          message: n.message,
          createdAt: n.createdAt
        };
      }),
      snapshots: snapshots.length
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Test overtake status error:', errorMessage)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
