"use client"

import { useState, useEffect } from "react"

interface ClientChartProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientChart({ children, fallback }: ClientChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return fallback || <div className="h-[200px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
  }

  return <>{children}</>
}