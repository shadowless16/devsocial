import { NextRequest, NextResponse } from "next/server"
import { getSession } from '@/lib/server-auth'
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Mission from "@/models/Mission"
import User from "@/models/User"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(session.user.id)
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { count = 5 } = await request.json()

    // Get existing mission titles to avoid duplicates
    const existingMissions = await Mission.find({}, 'title').lean()
    const existingTitles = existingMissions.map(m => m.title.toLowerCase())

    const response = await fetch(`${process.env.MISTRAL_API_BASE || 'https://api.mistral.ai'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: 'Return only valid JSON array, no markdown. Create unique missions that don\'t duplicate existing ones.'
          },
          {
            role: 'user',
            content: `Generate ${count} unique developer missions. Avoid these existing titles: ${existingTitles.join(', ')}.

JSON format:
[{
  "title": "Code Review Master",
  "description": "Help others by reviewing their code submissions",
  "type": "social",
  "difficulty": "intermediate", 
  "duration": "weekly",
  "steps": [{
    "id": "step1",
    "title": "Review 5 code submissions",
    "description": "Provide helpful feedback on community code",
    "target": 5,
    "metric": "code_reviews"
  }],
  "rewards": {"xp": 100, "badge": "Code Mentor"}
}]

Types: social, content, engagement, learning, achievement
Difficulties: beginner, intermediate, advanced, expert
Durations: daily, weekly, monthly, permanent
Metrics: posts, follows, likes_given, comments, code_reviews, profile_views`
          }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    })

    const data = await response.json()
    const content = data.choices[0]?.message?.content?.trim()
    
    let missions = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))

    const savedMissions = []
    for (const missionData of missions) {
      const mission = new Mission({
        ...missionData,
        createdBy: session.user.id,
        aiGenerated: true,
        isActive: true
      })
      
      savedMissions.push(await mission.save())
    }

    return NextResponse.json({
      success: true,
      data: { missions: savedMissions, count: savedMissions.length }
    })

  } catch (error) {
    console.error("Mission generation error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to generate missions"
    }, { status: 500 })
  }
}
