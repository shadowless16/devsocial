"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Users, Star } from "lucide-react"

interface MissionStep {
  id: string
  title: string
  description: string
  target: number
  metric: string
  completed: boolean
}

interface Mission {
  _id: string
  title: string
  description: string
  type: string
  difficulty: string
  duration: string
  steps: MissionStep[]
  rewards: {
    xp: number
    badge?: string
    title?: string
    specialReward?: string
  }
  participantCount: number
  userProgress?: {
    status: string
    progress: Array<{
      stepId: string
      current: number
      target: number
      completed: boolean
    }>
    completedAt?: Date
  }
}

interface MissionCardProps {
  mission: Mission
  onJoin: (missionId: string) => void
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800", 
  advanced: "bg-orange-100 text-orange-800",
  expert: "bg-red-100 text-red-800"
}

const typeIcons = {
  social: Users,
  content: Star,
  engagement: Trophy,
  learning: Clock,
  achievement: Trophy
}

export default function MissionCard({ mission, onJoin }: MissionCardProps) {
  const TypeIcon = typeIcons[mission.type as keyof typeof typeIcons] || Trophy
  const isCompleted = mission.userProgress?.status === "completed"
  const isActive = mission.userProgress?.status === "active"
  
  const overallProgress = mission.userProgress?.progress 
    ? (mission.userProgress.progress.filter(p => p.completed).length / mission.userProgress.progress.length) * 100
    : 0

  return (
    <Card className={`transition-all hover:shadow-lg ${isCompleted ? 'border-green-500 bg-green-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{mission.title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge className={difficultyColors[mission.difficulty as keyof typeof difficultyColors]}>
              {mission.difficulty}
            </Badge>
            <Badge variant="outline">{mission.duration}</Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{mission.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Steps */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Mission Steps:</h4>
          {mission.steps.map((step) => {
            const stepProgress = mission.userProgress?.progress.find(p => p.stepId === step.id)
            const stepCompleted = stepProgress?.completed || false
            
            return (
              <div key={step.id} className={`p-2 rounded-lg border ${stepCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{step.title}</span>
                  {stepCompleted && <Badge className="bg-green-100 text-green-800">✓</Badge>}
                </div>
                {stepProgress && (
                  <Progress 
                    value={(stepProgress.current / stepProgress.target) * 100} 
                    className="mt-1 h-2"
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Overall Progress */}
        {isActive && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        )}

        {/* Rewards */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Rewards:</h4>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">{mission.rewards.xp} XP</Badge>
            {mission.rewards.badge && (
              <Badge variant="secondary">🏆 {mission.rewards.badge}</Badge>
            )}
            {mission.rewards.title && (
              <Badge variant="secondary">👑 {mission.rewards.title}</Badge>
            )}
            {mission.rewards.specialReward && (
              <Badge className="bg-purple-100 text-purple-800">
                ⭐ {mission.rewards.specialReward}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-500">
            {mission.participantCount} participants
          </span>
          
          {!mission.userProgress ? (
            <Button onClick={() => onJoin(mission._id)} size="sm">
              Join Mission
            </Button>
          ) : isCompleted ? (
            <Badge className="bg-green-100 text-green-800">
              ✅ Completed
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-800">
              🎯 In Progress
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}