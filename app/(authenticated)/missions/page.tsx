"use client"

import { useMemo, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MissionsFilters, { type MissionFiltersState } from "@/components/missions-filters"
import MissionCard, { type Mission } from "@/components/mission-card"
import DensityToggle, { type Density } from "@/components/density-toggle"
import { apiClient } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

export default function MissionsPage() {
  const [tab, setTab] = useState<"available" | "active" | "completed">("available")
  const [filters, setFilters] = useState<MissionFiltersState>({
    type: "all",
    difficulty: "all",
    duration: "all",
  })
  const [density, setDensity] = useState<Density>("compact")
  const [allMissions, setAllMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchMissions()
  }, [refreshKey])

  const fetchMissions = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getMissions()
      if (response.success && response.data) {
        setAllMissions((response.data as any).missions || [])
      } else {
        setError("Failed to load missions")
      }
    } catch (err) {
      setError("Error loading missions")
    } finally {
      setLoading(false)
    }
  }

  const missions = useMemo(() => {
    let base = allMissions
    
    // Filter by tab status based on user progress
    if (tab === "available") {
      base = allMissions.filter(m => !m.userProgress || m.userProgress.status !== "active" && m.userProgress.status !== "completed")
    } else if (tab === "active") {
      base = allMissions.filter(m => m.userProgress?.status === "active")
    } else if (tab === "completed") {
      base = allMissions.filter(m => m.userProgress?.status === "completed")
    }
    
    return base.filter((m) => {
      const typeOk = filters.type === "all" || m.type === filters.type
      const diffOk = filters.difficulty === "all" || m.difficulty === filters.difficulty
      const durOk = filters.duration === "all" || m.duration === filters.duration
      return typeOk && diffOk && durOk
    })
  }, [filters, tab, allMissions])

  const availableCount = allMissions.filter(m => !m.userProgress || (m.userProgress.status !== "active" && m.userProgress.status !== "completed")).length
  const activeCount = allMissions.filter(m => m.userProgress?.status === "active").length
  const completedCount = allMissions.filter(m => m.userProgress?.status === "completed").length

  if (loading) {
    return (
      <main className="min-h-[100svh] bg-muted/30">
        <div className="mx-auto w-full max-w-[110rem] px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading missions...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-[100svh] bg-muted/30">
        <div className="mx-auto w-full max-w-[110rem] px-4 py-6">
          <Card className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchMissions} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Try Again
            </button>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] bg-muted/30">
      <div className="mx-auto w-full max-w-[110rem] px-4 py-6">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Developer Missions</h1>
            <p className="text-sm text-muted-foreground">
              Complete missions to earn XP, badges, and unlock special rewards.
            </p>
          </div>
          <DensityToggle value={density} onChange={setDensity} />
        </header>

        <div className="sticky top-0 z-10 mb-5 grid gap-3 bg-muted/30 pb-3 pt-2 md:grid-cols-[1fr_auto]">
          <MissionsFilters value={filters} onChange={setFilters} />
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="md:justify-self-end">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="available">Available ({availableCount})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <section aria-label="Missions" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {missions.map((m) => (
            <MissionCard 
              key={m.id} 
              mission={m} 
              density={density} 
              onProgressUpdate={() => setRefreshKey(prev => prev + 1)}
            />
          ))}
          {missions.length === 0 ? (
            <Card className="col-span-full grid place-items-center rounded-2xl border-0 p-8 text-sm text-muted-foreground ring-1 ring-black/5">
              No missions match your filters.
            </Card>
          ) : null}
        </section>
      </div>
    </main>
  )
}