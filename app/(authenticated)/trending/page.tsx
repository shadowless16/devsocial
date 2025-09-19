"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthenticatedTrendingPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to public trending page
    router.replace('/trending')
  }, [router])
  
  return (
    <div className="flex items-center justify-center py-8">
      <p>Redirecting to trending page...</p>
    </div>
  )
}

// Note: The full trending component has been moved to /app/trending/page.tsx for public access
