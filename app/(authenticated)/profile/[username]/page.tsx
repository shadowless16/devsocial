"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { User, Activity, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileStats from '@/components/profile/ProfileStats'
import AchievementShowcase from '@/components/profile/AchievementShowcase'
import ActivityFeed from '@/components/profile/ActivityFeed'
import SkillProgress from '@/components/profile/SkillProgress'
import { Button } from '@/components/ui/button'

export default function UserProfile() {
  const params = useParams()
  const username = params.username as string
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [profileData, setProfileData] = useState<any>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [activitiesData, setActivitiesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Check if viewing own profile
        const ownProfile = currentUser?.username === username
        setIsOwnProfile(ownProfile)

        if (ownProfile) {
          // Redirect to own profile page
          window.location.href = '/profile'
          return
        }

        // Fetch user data
        const userResponse = await fetch(`/api/users/${username}`)
        
        if (!userResponse.ok) {
          throw new Error('User not found')
        }
        
        const userData = await userResponse.json()
        const user = userData.data.user
        
        console.log('User data:', user); // Debug log
        
        // Get recent posts from user data
        const activitiesData = user.recentPosts || []

        const profileData = {
          name: user.displayName || user.username,
          title: "Developer",
          location: user.location || "Not specified",
          joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          bio: user.bio || "No bio available",
          avatar: user.avatar,
          techStack: user.techStack || [],
          socialLinks: [],
          userId: user._id,
          username: user.username,
          followersCount: user.followersCount || 0,
          followingCount: user.followingCount || 0,
          isFollowing: user.isFollowing || false
        }
        
        console.log('Profile data with follow state:', profileData); // Debug log
        setProfileData(profileData)

        setStatsData({
          totalXP: user.points || 0,
          challengesCompleted: 0,
          communityRank: user.rank || 999,
          postsCreated: user.stats?.totalPosts || 0
        })

        setActivitiesData(activitiesData)

      } catch (error) {
        console.error('Error fetching user profile:', error)
        // Handle error - maybe show 404 page
      } finally {
        setLoading(false)
      }
    }

    if (username && currentUser) {
      fetchUserProfile()
    }
  }, [username, currentUser])

  const achievementsData = {
    badges: [],
    missions: [],
    certifications: []
  }

  const skillsData: any[] = []

  const tabOptions = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'skills', label: 'Skills', icon: TrendingUp }
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

  if (!profileData) {
    return (
      <div className="container mx-auto p-3 max-w-4xl">
        <div className="text-center py-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-2 max-w-4xl">
      {/* Profile Header */}
      <ProfileHeader 
        profile={profileData} 
        onEdit={() => {}} 
        isOwnProfile={false} 
        setProfileData={setProfileData}
      />
      
      {/* Stats */}
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
      </div>
    </div>
  )
}