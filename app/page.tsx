"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to be fully loaded
    if (status === "loading" || loading) {
      return
    }

    // If not authenticated, redirect to login
    if (status === "unauthenticated" || !session) {
      router.push("/auth/login")
      return
    }

    // If authenticated but user data is still loading, wait a bit more
    if (status === "authenticated" && !user) {
      return
    }

    // If authenticated and user data is available
    if (status === "authenticated" && user) {
      // Check if user has completed onboarding
      if (!user.onboardingCompleted) {
        router.push("/onboarding")
        return
      }

      // User is authenticated and has completed onboarding, redirect to main feed
      router.push("/home")
      return
    }
  }, [status, session, user, loading, router])

  // Show loading while determining where to redirect
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
