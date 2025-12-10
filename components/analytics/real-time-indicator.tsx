"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/core/utils"

interface RealTimeIndicatorProps {
  isLive?: boolean
  lastUpdated?: Date
  className?: string
}

export function RealTimeIndicator({ isLive = true, lastUpdated = new Date(), className }: RealTimeIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getTimeDifference = () => {
    const diff = Math.floor((currentTime.getTime() - lastUpdated.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant={isLive ? "default" : "secondary"}
        className={cn("gap-1", isLive && "bg-emerald-600 hover:bg-emerald-600")}
      >
        <div className={cn("h-2 w-2 rounded-full", isLive ? "bg-white animate-pulse" : "bg-muted-foreground")} />
        {isLive ? "Live" : "Offline"}
      </Badge>
      <span className="text-xs text-muted-foreground">Updated {getTimeDifference()}</span>
    </div>
  )
}
