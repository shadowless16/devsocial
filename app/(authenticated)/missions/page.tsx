"use client"

import { useState } from "react"
import { Target, Clock, Trophy, Star, CheckCircle, Lock, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const missions = [
  {
    id: "daily-login",
    title: "Daily Login Streak",
    description: "Log in for 7 consecutive days",
    type: "daily",
    xpReward: 70,
    progress: 5,
    maxProgress: 7,
    status: "active",
    timeLeft: "19h 23m",
    difficulty: "easy",
  },
  {
    id: "first-post",
    title: "Share Your First Post",
    description: "Create and publish your first post to the community",
    type: "beginner",
    xpReward: 50,
    progress: 1,
    maxProgress: 1,
    status: "completed",
    difficulty: "easy",
  },
  {
    id: "comment-master",
    title: "Comment Master",
    description: "Leave 10 helpful comments on other posts",
    type: "social",
    xpReward: 100,
    progress: 7,
    maxProgress: 10,
    status: "active",
    difficulty: "medium",
  },
  {
    id: "code-snippet",
    title: "Code Snippet Sharer",
    description: "Share 3 code snippets with the community",
    type: "technical",
    xpReward: 150,
    progress: 1,
    maxProgress: 3,
    status: "active",
    difficulty: "medium",
  },
  {
    id: "weekly-challenge",
    title: "Weekly Challenge Champion",
    description: "Complete this week's coding challenge",
    type: "challenge",
    xpReward: 200,
    progress: 0,
    maxProgress: 1,
    status: "active",
    timeLeft: "3d 12h",
    difficulty: "hard",
  },
  {
    id: "mentor",
    title: "Mentor Mode",
    description: "Help 5 beginners by answering their questions",
    type: "social",
    xpReward: 250,
    progress: 0,
    maxProgress: 5,
    status: "locked",
    requirement: "Reach Level 10",
    difficulty: "hard",
  },
]

const achievements = [
  {
    id: "early-bird",
    title: "Early Bird",
    description: "Completed 5 daily missions",
    icon: "🌅",
    unlockedAt: "2 days ago",
  },
  {
    id: "social-butterfly",
    title: "Social Butterfly",
    description: "Received 50 likes on your posts",
    icon: "🦋",
    unlockedAt: "1 week ago",
  },
  {
    id: "code-ninja",
    title: "Code Ninja",
    description: "Shared 10 code snippets",
    icon: "🥷",
    unlockedAt: "2 weeks ago",
  },
]

export default function MissionsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "achievements">("active")

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "daily":
        return <Clock className="w-4 h-4" />
      case "challenge":
        return <Trophy className="w-4 h-4" />
      case "social":
        return <Star className="w-4 h-4" />
      case "technical":
        return <Target className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const activeMissions = missions.filter((m) => m.status === "active")
  const completedMissions = missions.filter((m) => m.status === "completed")

  return (
    <div className="max-w-4xl mx-auto py-4 lg:py-6 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-3 rounded-full">
            <Target className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-2">Missions & Achievements</h1>
        <p className="text-gray-600">Complete missions to earn XP and unlock achievements!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-1">{activeMissions.length}</div>
            <div className="text-sm text-gray-600">Active Missions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{completedMissions.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{achievements.length}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          {(["active", "completed", "achievements"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={`capitalize ${
                activeTab === tab ? "bg-white shadow-sm text-navy-900" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Missions */}
      {activeTab === "active" && (
        <div className="space-y-4">
          {activeMissions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-emerald-100 p-2 rounded-lg">{getTypeIcon(mission.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{mission.title}</h3>
                        <Badge className={getDifficultyColor(mission.difficulty)}>{mission.difficulty}</Badge>
                        {mission.timeLeft && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {mission.timeLeft}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{mission.description}</p>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {mission.progress}/{mission.maxProgress}
                          </span>
                        </div>
                        <Progress value={(mission.progress / mission.maxProgress) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                      <Zap className="w-4 h-4" />
                      <span>+{mission.xpReward} XP</span>
                    </div>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Continue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Locked Missions */}
          {missions
            .filter((m) => m.status === "locked")
            .map((mission) => (
              <Card key={mission.id} className="opacity-60">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-500">{mission.title}</h3>
                          <Badge className="bg-gray-100 text-gray-600">Locked</Badge>
                        </div>
                        <p className="text-gray-500 mb-2">{mission.description}</p>
                        <p className="text-sm text-orange-600 font-medium">Requirement: {mission.requirement}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        <Zap className="w-4 h-4" />
                        <span>+{mission.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Completed Missions */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          {completedMissions.map((mission) => (
            <Card key={mission.id} className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{mission.title}</h3>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      <p className="text-gray-600">{mission.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>+{mission.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Achievements */}
      {activeTab === "achievements" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">{achievement.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  Unlocked {achievement.unlockedAt}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
