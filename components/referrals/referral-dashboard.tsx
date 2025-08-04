"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Copy, Share2, Users, Gift, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReferralStats {
  stats: {
    pending?: { count: number; rewards: number }
    completed?: { count: number; rewards: number }
    expired?: { count: number; rewards: number }
  }
  recentReferrals: Array<{
    _id: string
    referred: {
      username: string
      displayName: string
      avatar?: string
    }
    status: string
    createdAt: string
    completedAt?: string
    referrerReward: number
  }>
}

export function ReferralDashboard() {
  const [referralCode, setReferralCode] = useState("")
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      // Fetch referral code
      const codeResponse = await fetch("/api/referrals/create")
      const codeData = await codeResponse.json()

      if (codeData.success) {
        setReferralCode(codeData.data.referralCode)
      }

      // Fetch referral stats
      const statsResponse = await fetch("/api/referrals/stats")
      const statsData = await statsResponse.json()

      if (statsData.success) {
        setStats(statsData.data)
      }
    } catch (error) {
      console.error("Error fetching referral data:", error)
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getReferralLink = () => {
    return `${window.location.origin}/auth/signup?ref=${referralCode}`
  }

  const copyReferralLink = () => {
    const referralLink = getReferralLink()
    navigator.clipboard.writeText(referralLink)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    })
  }

  const shareReferral = async () => {
    const referralLink = getReferralLink()

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join DevSocial",
          text: "Join me on DevSocial - the developer community platform!",
          url: referralLink,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      copyReferralLink()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const completedCount = stats?.stats.completed?.count || 0
  const pendingCount = stats?.stats.pending?.count || 0
  const totalRewards = stats?.stats.completed?.rewards || 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Successful Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total XP Earned</p>
                <p className="text-2xl font-bold text-gray-900">{totalRewards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link with friends to earn 25 XP for each successful referral</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input value={getReferralLink()} readOnly className="flex-1" />
            <Button onClick={copyReferralLink} variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={shareReferral} className="bg-emerald-600 hover:bg-emerald-700">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-medium text-emerald-800 mb-2">How it works:</h4>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• Friend signs up using your referral link</li>
              <li>• They create at least 1 post and earn 50 XP</li>
              <li>• You both get rewarded with XP!</li>
              <li>• Referrals are checked automatically when users are active</li>
              <li>• Referral links expire after 30 days if not completed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>Track your referral progress</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentReferrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400">Start sharing your referral link to earn rewards!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.recentReferrals.map((referral) => (
                <div key={referral._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={referral.referred.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {referral.referred.displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{referral.referred.displayName}</p>
                      <p className="text-sm text-gray-500">@{referral.referred.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={referral.status === "completed" ? "default" : "secondary"}
                      className={referral.status === "completed" ? "bg-emerald-100 text-emerald-800" : ""}
                    >
                      {referral.status}
                    </Badge>
                    {referral.status === "completed" && (
                      <span className="text-sm font-medium text-emerald-600">+{referral.referrerReward} XP</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
