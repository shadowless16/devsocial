// components/gamification/xp-bar.tsx
"use client"

import { useState, useEffect } from "react"
import { useCachedUser } from "@/hooks/use-cached-user";
import { Progress } from "@/components/ui/progress"
import { Star, Zap, X } from "lucide-react"

export function XPBar() {
  const { user, loading } = useCachedUser();
  const [showAnimation, setShowAnimation] = useState(false)
  const [displayXp, setDisplayXp] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Sync displayXp with user points when user data loads
  useEffect(() => {
    if (user) {
      setDisplayXp(user.points);
    }
  }, [user]);

  // Early return after all hooks
  if (loading || !user) return null;

  const progressPercentage = (user.points / user.totalXpForLevel) * 100

  // Simulate XP gain animation
  const triggerXpGain = (amount: number) => {
    setShowAnimation(true)
    setDisplayXp((prev) => prev + amount)

    setTimeout(() => {
      setShowAnimation(false)
    }, 2000)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 p-1 rounded-full">
              <Star className="w-4 h-4 text-emerald-600" />
            </div>
<span className="font-semibold text-gray-900">Level {user.level}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <span className="text-sm font-medium text-emerald-600">{displayXp} XP</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Progress value={progressPercentage} className="h-2 mb-2" />

        <div className="flex justify-between text-xs text-gray-500">
<span>{user.xpToNext} XP to next level</span>
          <span>{user.totalXpForLevel} XP</span>
        </div>

        {/* XP Gain Animation */}
        {showAnimation && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>+25 XP</span>
            </div>
          </div>
        )}

        {/* Test button for XP animation - remove in production */}
        <button
          onClick={() => triggerXpGain(25)}
          className="mt-2 w-full text-xs bg-emerald-50 text-emerald-600 py-1 rounded hover:bg-emerald-100 transition-colors"
        >
          Test XP Gain
        </button>
      </div>
    </div>
  )
}
