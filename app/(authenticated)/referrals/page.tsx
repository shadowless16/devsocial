"use client"

import { useState, useEffect } from "react"
import { ReferralDashboard } from "@/components/referrals/referral-dashboard"
import { ReferralSkeleton } from "@/components/skeletons/referral-skeleton"

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <ReferralSkeleton />
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
        <p className="text-gray-600 mt-2">Invite friends to join DevSocial and earn rewards together!</p>
      </div>

      <ReferralDashboard />
    </div>
  )
}
