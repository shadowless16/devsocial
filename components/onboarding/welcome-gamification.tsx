"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Users, Target } from "lucide-react"

interface WelcomeGamificationProps {
  data: any
  onNext: (data: any) => void
  onBack?: () => void
}

export function WelcomeGamification({ data, onNext, onBack }: WelcomeGamificationProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [xpAnimation, setXpAnimation] = useState(0)

  useEffect(() => {
    setShowConfetti(true)
    // Animate XP counter
    const timer = setInterval(() => {
      setXpAnimation((prev) => {
        if (prev < 10) return prev + 1
        clearInterval(timer)
        return 10
      })
    }, 100)

    return () => clearInterval(timer)
  }, [])

  const handleComplete = () => {
    onNext({ completed: true })
  }

  return (
    <div className="space-y-6">
      {showConfetti && (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-emerald-600 mb-2">Welcome to DevSocial!</h3>
          <p className="text-gray-600">You've earned your first 10 XP!</p>
        </div>
      )}

      {/* XP Display */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="text-2xl font-bold text-emerald-600">{xpAnimation} XP</span>
          </div>
          <Progress value={10} max={100} className="w-full mb-2" />
          <p className="text-sm text-gray-600">Level 1 • 90 XP to Level 2</p>
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <div className="space-y-4">
        <h4 className="font-semibold text-center">How to Earn XP:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Create Posts</p>
                <p className="text-sm text-gray-600">+20 XP</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Comment & Engage</p>
                <p className="text-sm text-gray-600">+5 XP</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Daily Login</p>
                <p className="text-sm text-gray-600">+10 XP</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Complete Challenges</p>
                <p className="text-sm text-gray-600">+50 XP</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leaderboard Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <h4 className="font-semibold mb-2">Compete on the Leaderboard!</h4>
          <p className="text-sm text-gray-600">See how you rank against other developers in your branch and globally</p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700 ml-auto">
          Start My Journey! 🚀
        </Button>
      </div>
    </div>
  )
}
