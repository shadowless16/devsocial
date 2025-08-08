"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MissionCard from "@/components/missions/MissionCard"
import { toast } from "sonner"

interface Mission {
  _id: string
  title: string
  description: string
  type: string
  difficulty: string
  duration: string
  steps: any[]
  rewards: any
  participantCount: number
  userProgress?: any
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: "",
    difficulty: "",
    duration: ""
  })

  useEffect(() => {
    fetchMissions()
  }, [filters])

  const fetchMissions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.difficulty) params.append("difficulty", filters.difficulty)
      if (filters.duration) params.append("duration", filters.duration)

      const response = await fetch(`/api/missions?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setMissions(data.missions)
      } else {
        toast.error("Failed to load missions")
      }
    } catch (error) {
      toast.error("Error loading missions")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinMission = async (missionId: string) => {
    try {
      const response = await fetch("/api/missions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId })
      })

      if (response.ok) {
        toast.success("Mission joined successfully!")
        fetchMissions() // Refresh to show updated status
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to join mission")
      }
    } catch (error) {
      toast.error("Error joining mission")
    }
  }

  const activeMissions = missions.filter(m => m.userProgress?.status === "active")
  const completedMissions = missions.filter(m => m.userProgress?.status === "completed")
  const availableMissions = missions.filter(m => !m.userProgress)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Developer Missions</h1>
        <p className="text-gray-600">
          Complete missions to earn XP, badges, and unlock special rewards
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="achievement">Achievement</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.duration} onValueChange={(value) => setFilters(prev => ({ ...prev, duration: value }))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Durations</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="permanent">Permanent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">
            Available ({availableMissions.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeMissions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedMissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableMissions.map(mission => (
              <MissionCard
                key={mission._id}
                mission={mission}
                onJoin={handleJoinMission}
              />
            ))}
          </div>
          {availableMissions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No available missions found
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeMissions.map(mission => (
              <MissionCard
                key={mission._id}
                mission={mission}
                onJoin={handleJoinMission}
              />
            ))}
          </div>
          {activeMissions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No active missions. Join some missions to get started!
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedMissions.map(mission => (
              <MissionCard
                key={mission._id}
                mission={mission}
                onJoin={handleJoinMission}
              />
            ))}
          </div>
          {completedMissions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No completed missions yet. Complete some missions to see them here!
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}