"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, Clock, Zap, Target, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Challenge {
  _id: string
  title: string
  description: string
  type: string
  difficulty: "easy" | "medium" | "hard"
  requirements: {
    target: number
    metric: string
    description: string
  }
  rewards: {
    xp: number
    badge?: string
    title?: string
  }
  startDate: string
  endDate: string
  participantCount: number
  completionCount: number
  firstCompletionBonus: number
}

interface Participation {
  _id: string
  challenge: Challenge
  status: "active" | "completed" | "failed"
  progress: number
  completedAt?: string
  isFirstCompletion: boolean
  xpEarned: number
}

export function WeeklyChallenges() {
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([])
  const [userChallenges, setUserChallenges] = useState<Participation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchChallenges = useCallback(async () => {
    try {
      const [challengesRes, userChallengesRes] = await Promise.all([
        fetch("/api/challenges"),
        fetch("/api/challenges/user"),
      ])

      const challengesData = await challengesRes.json()
      const userChallengesData = await userChallengesRes.json()

      if (challengesData.success) {
        setActiveChallenges(challengesData.data.challenges)
      }

      if (userChallengesData.success) {
        setUserChallenges(userChallengesData.data.challenges)
      }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error fetching challenges:", errorMessage)
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const joinChallenge = useCallback(async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success!",
          description: "You've joined the challenge!",
        })
        fetchChallenges()
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error joining challenge:", errorMessage)
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive",
      })
    }
  }, [fetchChallenges, toast])

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
      case "post_creation":
        return <Target className="w-4 h-4" />
      case "engagement":
        return <Users className="w-4 h-4" />
      case "community":
        return <Award className="w-4 h-4" />
      default:
        return <Trophy className="w-4 h-4" />
    }
  }

  const isUserParticipating = (challengeId: string) => {
    return userChallenges.some((p) => p.challenge._id === challengeId)
  }

  const getUserParticipation = (challengeId: string) => {
    return userChallenges.find((p) => p.challenge._id === challengeId)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active challenges</p>
                <p className="text-sm text-gray-400">Check back later for new challenges!</p>
              </CardContent>
            </Card>
          ) : (
            activeChallenges.map((challenge) => {
              const participation = getUserParticipation(challenge._id)
              const isParticipating = isUserParticipating(challenge._id)

              return (
                <Card key={challenge._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(challenge.type)}
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        </div>
                        <CardDescription>{challenge.description}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                        <div className="text-sm text-gray-500 text-right">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{challenge.participantCount} joined</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Requirements:</h4>
                      <p className="text-sm text-gray-600">{challenge.requirements.description}</p>
                      <p className="text-sm font-medium mt-1">
                        Target: {challenge.requirements.target} {challenge.requirements.metric}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-sm">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span>{challenge.rewards.xp} XP</span>
                        </div>
                        {challenge.firstCompletionBonus > 0 && (
                          <div className="flex items-center space-x-1 text-sm text-emerald-600">
                            <Award className="w-4 h-4" />
                            <span>+{challenge.firstCompletionBonus} XP (First!)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {new Date(challenge.endDate).toLocaleDateString()}
                        </div>

                        {!isParticipating ? (
                          <Button
                            onClick={() => joinChallenge(challenge._id)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Join Challenge
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                            {participation?.status === "completed" ? "Completed" : "Joined"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {participation && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(participation.progress)}%</span>
                        </div>
                        <Progress value={participation.progress} className="h-2" />
                        {participation.status === "completed" && (
                          <div className="text-sm text-emerald-600 font-medium">
                            ✅ Completed! Earned {participation.xpEarned} XP
                            {participation.isFirstCompletion && " (First completion bonus!)"}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="my-challenges" className="space-y-4">
          {userChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No challenges joined yet</p>
                <p className="text-sm text-gray-400">Join some challenges to start earning XP!</p>
              </CardContent>
            </Card>
          ) : (
            userChallenges.map((participation) => (
              <Card key={participation._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{participation.challenge.title}</CardTitle>
                      <CardDescription>{participation.challenge.description}</CardDescription>
                    </div>
                    <Badge
                      variant={participation.status === "completed" ? "default" : "secondary"}
                      className={participation.status === "completed" ? "bg-emerald-100 text-emerald-800" : ""}
                    >
                      {participation.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(participation.progress)}%</span>
                    </div>
                    <Progress value={participation.progress} className="h-2" />
                  </div>

                  {participation.status === "completed" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-emerald-800">
                        <Trophy className="w-4 h-4" />
                        <span className="font-medium">Challenge Completed!</span>
                      </div>
                      <p className="text-sm text-emerald-700 mt-1">
                        Earned {participation.xpEarned} XP
                        {participation.isFirstCompletion && " (including first completion bonus!)"}
                      </p>
                      {participation.completedAt && (
                        <p className="text-xs text-emerald-600 mt-1">
                          Completed on {new Date(participation.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
