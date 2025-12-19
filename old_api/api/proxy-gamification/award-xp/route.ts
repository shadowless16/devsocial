import { NextRequest, NextResponse } from 'next/server'
import { isServiceEnabled } from '@/lib/config/feature-flags'
import { proxyToService } from '@/lib/api/service-proxy'
import { GamificationService } from '@/utils/gamification-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { action, content, refId } = body

  if (isServiceEnabled('USE_GAMIFICATION_SERVICE')) {
    try {
      return await proxyToService('gamification', '/api/gamification/award-xp', {
        method: 'POST',
        headers: { 
          Authorization: req.headers.get('Authorization') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, content, refId })
      })
    } catch (error) {
      console.error('Gamification service error, falling back to Next.js:', error)
    }
  }

  const result = await GamificationService.awardXP(session.user.id, action, content, refId)
  return NextResponse.json(result)
}
