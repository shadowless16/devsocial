"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Check if we're getting database errors
    const checkConnectivity = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (!response.ok && response.status >= 500) {
          setIsOffline(true)
        } else {
          setIsOffline(false)
        }
      } catch {
        setIsOffline(true)
      }
    }

    checkConnectivity()
    const interval = setInterval(checkConnectivity, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (!isOffline) return null

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        Database connection unavailable. Showing demo data.
      </AlertDescription>
    </Alert>
  )
}