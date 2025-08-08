"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Target, Trophy } from "lucide-react"

interface Challenge {
  _id: string
  title: string
  description: string
  difficulty: string
  techStack?: string[]
  experienceLevel?: string
  rewards: {
    xp: number
    badge?: string
    title?: string
  }
  recommendationScore: number
  recommendationReasons: string[]
}

export default function RecommendedChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendedChallenges()
  }, [])

  const fetchRecommendedChallenges = async () => {
    try {
      const response = await fetch("/api/challenges/recommended?limit=5")
      const data = await response.json()
      
      if (response.ok) {
        setChallenges(data.challenges)
      }
    } catch (error) {
      console.error("Error fetching recommended challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch("/api/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId })
      })

      if (response.ok) {
        setChallenges(prev => prev.filter(c => c._id !== challengeId))
      }
    } catch (error) {
      console.error("Error joining challenge:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No personalized recommendations available yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map(challenge => (
          <div key={challenge._id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{challenge.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
              </div>
              <Badge variant="outline" className="ml-2">
                {Math.round(challenge.recommendationScore)}% match
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {challenge.difficulty}
              </Badge>
              {challenge.experienceLevel && (
                <Badge variant="outline">
                  {challenge.experienceLevel}
                </Badge>
              )}
              {challenge.techStack?.slice(0, 2).map(tech => (
                <Badge key={tech} className="bg-green-100 text-green-800">
                  {tech}
                </Badge>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              <Target className="h-3 w-3 inline mr-1" />
              {challenge.recommendationReasons[0]}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{challenge.rewards.xp} XP</span>
                {challenge.rewards.badge && (
                  <span className="text-gray-500">+ Badge</span>
                )}
              </div>
              <Button 
                size="sm" 
                onClick={() => handleJoinChallenge(challenge._id)}
              >
                Join Challenge
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}