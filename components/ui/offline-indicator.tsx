"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Simplified check - just check navigator.onLine or a basic health check
    const checkConnectivity = async () => {
      try {
        // Use a lightweight health check to the actual backend instead of session
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api'}/health`)
        setIsOffline(!response.ok)
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