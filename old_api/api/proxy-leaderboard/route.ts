import { NextRequest, NextResponse } from 'next/server'
import { isServiceEnabled } from '@/lib/config/feature-flags'
import { proxyToService } from '@/lib/api/service-proxy'
import { GamificationService } from '@/utils/gamification-service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'all-time'
  const limit = parseInt(searchParams.get('limit') || '50')

  if (isServiceEnabled('USE_GAMIFICATION_SERVICE')) {
    try {
      return await proxyToService('gamification', `/api/leaderboard?type=${type}&limit=${limit}`, {
        method: 'GET',
        headers: { Authorization: req.headers.get('Authorization') || '' }
      })
    } catch (error) {
      console.error('Gamification service error, falling back to Next.js:', error)
    }
  }

  const leaderboard = await GamificationService.getLeaderboard(type as 'all-time' | 'weekly' | 'monthly', limit)
  return NextResponse.json({ success: true, data: { leaderboard } })
}
