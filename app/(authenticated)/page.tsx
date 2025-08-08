"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function AuthenticatedRedirectPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for user data to load
    if (loading) {
      return
    }

    // If user data is available, check onboarding status
    if (user) {
      if (!user.onboardingCompleted) {
        router.push("/onboarding")
        return
      }
      
      // User has completed onboarding, redirect to home
      router.push("/home")
      return
    }

    // If no user data, this shouldn't happen in the authenticated layout
    // but redirect to login as fallback
    router.push("/auth/login")
  }, [user, loading, router])

  // Show loading while determining where to redirect
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
