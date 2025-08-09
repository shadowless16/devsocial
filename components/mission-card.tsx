"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Star, Trophy } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Density } from "./density-toggle"

export type Mission = {
  id: string
  title: string
  subtitle?: string
  description?: string
  levelTag?: "beginner" | "intermediate" | "advanced" | "expert"
  cadenceTag?: "weekly" | "monthly" | "permanent" | "daily"
  icon?: "trophy" | "book" | "star"
  type: "achievement" | "learning" | "content" | "social" | "engagement"
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  duration: "weekly" | "monthly" | "permanent" | "daily"
  steps: string[] | Array<{id: string, title: string, description: string, target: number, metric: string, completed: boolean}>
  rewards: string[] | {xp: number, badge?: string, title?: string, specialReward?: string}
  participants?: number
  participantCount?: number
  userProgress?: {
    status: string
    stepsCompleted: string[]
    progress?: Array<{stepId: string, current: number, target: number}>
  }
}

type Props = { mission?: Mission; density?: Density; onProgressUpdate?: () => void }
export default function MissionCard({
  mission = {
    id: "sample",
    title: "Sample Mission",
    subtitle: "Improve your skills through guided tasks",
    levelTag: "advanced",
    cadenceTag: "monthly",
    icon: "book",
    type: "learning",
    difficulty: "advanced",
    duration: "monthly",
    steps: ["Do a thing", "Share something", "Help someone"],
    rewards: ["200 XP", "A nice badge"],
    participants: 0,
  },
  density = "compact",
  onProgressUpdate,
}: Props) {
  const [joining, setJoining] = useState(false)
  const [userProgress, setUserProgress] = useState(mission.userProgress)

  const isJoined = userProgress?.status === "active" || userProgress?.status === "completed"
  const isCompleted = userProgress?.status === "completed"

  const pad = density === "compact" ? "p-4" : "p-5"
  const padX = density === "compact" ? "px-4" : "px-5"
  const textBase = density === "compact" ? "text-[13px]" : "text-sm"
  const titleSize = density === "compact" ? "text-[15px]" : "text-base"
  const stepPad = density === "compact" ? "px-3 py-1.5" : "px-3 py-2"

  const Icon = mission.icon === "trophy" ? Trophy : mission.icon === "star" ? Star : BookOpen

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-0 ring-1 ring-black/5 transition-all hover:shadow-lg/30 motion-safe:hover:-translate-y-[2px]">
      <CardHeader className={`flex flex-row items-center gap-3 space-y-0 ${pad}`}>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`truncate ${titleSize} font-semibold leading-tight`}>{mission.title}</h3>
            <Badge className="rounded-full bg-emerald-50 px-2 text-[10px] font-medium text-emerald-700 hover:bg-emerald-50">
              {mission.levelTag}
            </Badge>
            <Badge className="rounded-full bg-muted px-2 text-[10px] font-medium text-muted-foreground hover:bg-muted">
              {mission.cadenceTag}
            </Badge>
          </div>
          <p className={`mt-1 line-clamp-1 ${textBase} text-muted-foreground`}>{mission.subtitle || mission.description}</p>
        </div>
      </CardHeader>

      <CardContent className={`flex-1 space-y-3 ${padX}`}>
        <div>
          <div className={`${textBase} mb-2 font-medium`}>Mission Steps</div>
          <ul className="grid gap-1.5">
            {mission.steps.map((s, idx) => {
              const stepId = typeof s === 'string' ? s : s.id
              const stepCompleted = userProgress?.stepsCompleted?.includes(stepId) || false
              const stepTarget = typeof s === 'object' ? s.target : 1
              const stepMetric = typeof s === 'object' ? s.metric : ''
              const stepTitle = typeof s === 'string' ? s : s.title
              
              // Get current progress for this step
              const stepProgress = userProgress?.progress?.find(p => p.stepId === stepId)
              let currentValue = stepProgress?.current || 0
              
              // If step is completed, show target value
              if (stepCompleted && stepTarget > 1) {
                currentValue = stepTarget
              }
              
              return (
                <li
                  key={idx}
                  className={`rounded-lg border border-transparent ${stepCompleted ? 'bg-emerald-100/60' : 'bg-muted/60'} ${stepPad}`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox id={`${mission.id}-${idx}`} checked={stepCompleted} disabled />
                    <label
                      htmlFor={`${mission.id}-${idx}`}
                      className={`select-none ${textBase} leading-6 ${stepCompleted ? 'text-emerald-700 line-through' : 'text-foreground/90'} flex-1`}
                    >
                      {stepTitle}
                    </label>
                    {isJoined && stepTarget > 1 && (
                      <span className={`${textBase} ${stepCompleted ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                        {currentValue}/{stepTarget}
                      </span>
                    )}
                  </div>
                  {isJoined && stepTarget > 1 && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all bg-emerald-600`}
                        style={{ width: `${Math.min((currentValue / stepTarget) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          {isJoined && !isCompleted && (
            <div className="mt-2 text-xs text-muted-foreground">
              Progress: {userProgress?.stepsCompleted?.length || 0} / {mission.steps.length} steps
            </div>
          )}
        </div>
        <div className="rounded-xl bg-emerald-50/50 p-3">
          <div className={`${textBase} mb-1 font-medium text-emerald-800`}>Rewards</div>
          <ul className={`grid gap-1 ${textBase} text-emerald-900/90`}>
            {Array.isArray(mission.rewards) ? (
              mission.rewards.map((r, i) => (
                <li key={i} className="leading-6">
                  {r}
                </li>
              ))
            ) : (
              <>
                <li className="leading-6">{mission.rewards.xp} XP</li>
                {mission.rewards.badge && <li className="leading-6">{mission.rewards.badge}</li>}
                {mission.rewards.title && <li className="leading-6">{mission.rewards.title}</li>}
                {mission.rewards.specialReward && <li className="leading-6">{mission.rewards.specialReward}</li>}
              </>
            )}
          </ul>
        </div>
      </CardContent>

      <CardFooter className={`flex items-center justify-between gap-3 ${pad}`}>
        <div className="text-xs text-muted-foreground">
          {mission.participants || mission.participantCount || 0} {(mission.participants || mission.participantCount || 0) === 1 ? "participant" : "participants"}
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-lg bg-transparent">
                View details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{mission.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{mission.subtitle}</p>
                <div>
                  <div className="text-sm font-medium">Steps</div>
                  <ul className="mt-1 grid gap-1.5 text-sm">
                    {mission.steps.map((s, i) => (
                      <li key={i} className="leading-6">
                        {typeof s === 'string' ? s : s.title}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-medium">Rewards</div>
                  <ul className="mt-1 grid gap-1.5 text-sm">
                    {Array.isArray(mission.rewards) ? (
                      mission.rewards.map((r, i) => (
                        <li key={i} className="leading-6">
                          {r}
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="leading-6">{mission.rewards.xp} XP</li>
                        {mission.rewards.badge && <li className="leading-6">{mission.rewards.badge}</li>}
                        {mission.rewards.title && <li className="leading-6">{mission.rewards.title}</li>}
                        {mission.rewards.specialReward && <li className="leading-6">{mission.rewards.specialReward}</li>}
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            className={`rounded-lg px-4 ${
              isCompleted 
                ? "bg-green-600 hover:bg-green-600/90" 
                : isJoined 
                ? "bg-blue-600 hover:bg-blue-600/90" 
                : "bg-emerald-600 hover:bg-emerald-600/90"
            }`}
            disabled={joining || isCompleted}
            onClick={async () => {
              if (!isJoined) {
                setJoining(true)
                try {
                  const response = await fetch(`/api/missions/${mission._id || mission.id}/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  if (response.ok) {
                    setUserProgress({ status: 'active', stepsCompleted: [] })
                    onProgressUpdate?.()
                  }
                } catch (error) {
                  console.error('Failed to join mission:', error)
                } finally {
                  setJoining(false)
                }
              }
            }}
          >
            {isCompleted 
              ? "Completed" 
              : isJoined 
              ? "In Progress" 
              : joining 
              ? "Joining..." 
              : "Join Mission"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}