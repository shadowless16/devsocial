"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { getRankByXP, getNextRank, getProgressToNextRank } from "@/utils/rank-system"

interface RankDisplayProps {
  userXP: number
  showProgress?: boolean
  size?: "sm" | "md" | "lg"
}

export function RankDisplay({ userXP, showProgress = true, size = "md" }: RankDisplayProps) {
  const currentRank = getRankByXP(userXP)
  const nextRank = getNextRank(userXP)
  const progress = getProgressToNextRank(userXP)

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  const emojiSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  }

  return (
    <div className="space-y-2">
      {/* Current Rank */}
      <div className="flex items-center space-x-2">
        <span className={emojiSizes[size]}>{currentRank.emoji}</span>
        <Badge
          variant="secondary"
          className={`${sizeClasses[size]} font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800`}
        >
          {currentRank.title}
        </Badge>
      </div>

      {/* Naija Meaning */}
      <p className={`${sizeClasses[size]} text-gray-600 italic`}>"{currentRank.naijaMeaning}"</p>

      {/* Progress to Next Rank */}
      {showProgress && nextRank && (
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`${sizeClasses[size]} font-medium text-gray-700`}>
                  Next: {nextRank.emoji} {nextRank.title}
                </span>
                <span className={`${sizeClasses[size]} text-emerald-600 font-bold`}>
                  {progress.current}/{progress.required} XP
                </span>
              </div>

              <Progress value={progress.percentage} className="h-2 bg-gray-200" />

              <p className={`${sizeClasses[size]} text-gray-500 text-center`}>
                {progress.required - progress.current} XP to go!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Rank Perks */}
      {size === "lg" && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-800 mb-2">Your Perks:</h4>
          <div className="flex flex-wrap gap-1">
            {currentRank.perks.map((perk, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {perk}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
