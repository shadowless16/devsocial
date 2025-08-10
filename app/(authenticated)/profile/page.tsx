"use client"

import React, { useState, useEffect } from 'react'
import { User, Activity, TrendingUp, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileStats from '@/components/profile/ProfileStats'
import AchievementShowcase from '@/components/profile/AchievementShowcase'
import ActivityFeed from '@/components/profile/ActivityFeed'
import SkillProgress from '@/components/profile/SkillProgress'
import PrivacySettings from '@/components/profile/PrivacySettings'
import { Button } from '@/components/ui/button'

export default function MyProfile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [profileData, setProfileData] = useState<any>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [activitiesData, setActivitiesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const mockProfileData = {
    name: user?.displayName || user?.username || "User",
    title: "Full Stack Developer",
    location: "San Francisco, CA",
    joinDate: new Date((user as any)?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    bio: user?.bio || `Passionate developer building amazing applications and contributing to the community.`,
    avatar: user?.avatar || "/placeholder.svg",
    techStack: (user as any)?.techStack || ["JavaScript", "React", "Node.js", "TypeScript"],
    socialLinks: [
      { platform: "GitHub", icon: "Github", url: (user as any)?.githubUsername ? `https://github.com/${(user as any).githubUsername}` : "#" },
      { platform: "LinkedIn", icon: "Linkedin", url: (user as any)?.linkedinUrl || "#" },
      { platform: "Portfolio", icon: "Globe", url: (user as any)?.portfolioUrl || "#" }
    ].filter(link => link.url !== "#"),
    userId: (user as any)?._id,
    username: user?.username,
    followersCount: (user as any)?.followersCount || 0,
    followingCount: (user as any)?.followingCount || 0,
    isFollowing: false
  }

  const achievementsData = {
    badges: (user as any)?.badges?.map((badge: string) => ({
      name: badge.charAt(0).toUpperCase() + badge.slice(1),
      icon: "Trophy",
      date: "Dec 2024"
    })) || [],
    missions: [
      {
        name: "React Mastery Series",
        completedTasks: 8,
        totalTasks: 8,
        xpEarned: 800,
        completionDate: "Dec 15, 2024"
      }
    ],
    certifications: [
      {
        name: "AWS Solutions Architect",
        issuer: "Amazon Web Services",
        issueDate: "Nov 2024",
        logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=40&h=40&fit=crop"
      }
    ]
  }

  const mockActivitiesData = [
    {
      type: "post" as const,
      title: "Created a new post",
      description: "Shared insights about React Server Components",
      content: "Just finished implementing RSCs in our production app. The performance improvements are incredible!",
      timestamp: "2 hours ago",
      xpEarned: 25,
      engagement: { likes: 12, comments: 5, shares: 3 }
    },
    {
      type: "challenge" as const,
      title: "Completed Weekly Challenge",
      description: "Algorithm optimization challenge",
      timestamp: "1 day ago",
      xpEarned: 100,
      engagement: { likes: 8, comments: 2, shares: 1 }
    }
  ]

  const skillsData = [
    {
      name: "JavaScript",
      level: 95,
      projectsCompleted: 23,
      recentGain: 5,
      nextMilestone: "Expert Level",
      xpToNext: 50
    },
    {
      name: "React",
      level: 88,
      projectsCompleted: 18,
      recentGain: 8,
      nextMilestone: "Advanced Level",
      xpToNext: 120
    },
    {
      name: "Node.js",
      level: 82,
      projectsCompleted: 15,
      recentGain: 12,
      nextMilestone: "Advanced Level",
      xpToNext: 180
    }
  ]

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    showEmail: false,
    showLocation: true,
    showActivity: true,
    allowMessages: true,
    showStats: true
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/profile/stats')
        if (statsResponse.ok) {
          const { stats } = await statsResponse.json()
          setStatsData(stats)
        }

        // Fetch activities
        const activitiesResponse = await fetch('/api/profile/activity?limit=10')
        if (activitiesResponse.ok) {
          const { activities } = await activitiesResponse.json()
          setActivitiesData(activities)
        }

        setProfileData(mockProfileData)
      } catch (error) {
        console.error('Error fetching profile data:', error)
        // Fallback to mock data
        setStatsData({
          totalXP: (user as any)?.points || 0,
          challengesCompleted: 0,
          communityRank: 999,
          postsCreated: 0
        })
        setActivitiesData(mockActivitiesData)
        setProfileData(mockProfileData)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfileData()
    }
  }, [user])

  const handlePrivacySettingsChange = (newSettings: any) => {
    setPrivacySettings(newSettings)
    console.log('Privacy settings updated:', newSettings)
  }

  const tabOptions = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'skills', label: 'Skills', icon: TrendingUp },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  if (loading) {
    return (
      <div className="container mx-auto p-3 max-w-4xl">
        <div className="animate-pulse space-y-3">
          <div className="h-24 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-2 max-w-4xl">
      {/* Profile Header - Always Visible */}
      <ProfileHeader 
        profile={profileData} 
        onEdit={() => {}} 
        isOwnProfile={true} 
        setProfileData={setProfileData}
      />
      
      {/* Stats - Always Visible */}
      {statsData && <ProfileStats stats={statsData} />}

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-2 overflow-x-auto">
        {tabOptions.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className="whitespace-nowrap"
          >
            <tab.icon size={16} className="mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {activeTab === 'overview' && (
          <>
            <div className="lg:col-span-4">
              <AchievementShowcase achievements={achievementsData} />
            </div>
            <div className="lg:col-span-8">
              <ActivityFeed activities={activitiesData.slice(0, 6)} />
            </div>
          </>
        )}

        {activeTab === 'activity' && (
          <div className="lg:col-span-12">
            <ActivityFeed activities={activitiesData} />
          </div>
        )}

        {activeTab === 'skills' && (
          <>
            <div className="lg:col-span-8">
              <SkillProgress skills={skillsData} />
            </div>
            <div className="lg:col-span-4">
              <AchievementShowcase achievements={achievementsData} />
            </div>
          </>
        )}

        {activeTab === 'privacy' && (
          <div className="lg:col-span-6 lg:col-start-4">
            <PrivacySettings 
              settings={privacySettings}
              onSettingsChange={handlePrivacySettingsChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}