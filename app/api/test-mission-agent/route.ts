import { NextResponse } from 'next/server'
import { MissionAgent } from '@/lib/agents/missionAgent'

export async function GET() {
  try {
    const agent = new MissionAgent()
    const mission = await agent.createMission()
    
    return NextResponse.json({
      success: true,
      mission
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
