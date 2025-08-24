"use client"

import React, { useState, useEffect } from 'react'
import { User, Activity, TrendingUp, Shield, Wallet } from 'lucide-react'
import { TransactionHistory } from '@/components/transactions/transaction-history'
import { WalletBalanceDisplay } from '@/components/transactions/wallet-balance-display'
import { useAuth } from '@/contexts/auth-context'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileStats from '@/components/profile/ProfileStats'
import ActivityFeed from '@/components/profile/ActivityFeed'
import SkillProgress from '@/components/profile/SkillProgress'
import PrivacySettings from '@/components/profile/PrivacySettings'
import { ProfileSkeleton } from '@/components/skeletons/profile-skeleton'
import { Button } from '@/components/ui/button'

export default function MyProfile() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [profileData, setProfileData] = useState<any>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [activitiesData, setActivitiesData] = useState<any[]>([])

  useEffect(() => {
    if (authLoading) {
      // Don't do anything while auth is loading.
      // The loading skeleton will be shown.
      return;
    }
    if (!user) {
      // If the user is not logged in, we shouldn't be fetching data.
      // The component will render a "please log in" message.
      setProfileData(null);
      setStatsData(null);
      setActivitiesData([]);
      return;
    }

    const fetchPageData = async () => {
      try {
        // Fetch fresh user data to get latest follower counts etc.
        const profileResponse = await fetch('/api/users/profile');
        let userForProfile = user; // Fallback to user from auth context

        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          if (profileResult.success) {
            userForProfile = profileResult.data.user;
          }
        }

        // Try to fetch an authoritative follower count from the followers endpoint
        let authoritativeFollowers = (userForProfile as any)?.followersCount || 0;
        try {
          const username = userForProfile?.username;
          if (username) {
            const followersResp = await fetch(`/api/users/${encodeURIComponent(username)}/followers?limit=1`);
            if (followersResp.ok) {
              const followersJson = await followersResp.json();
              const total = followersJson?.data?.pagination?.totalCount;
              if (typeof total === 'number') authoritativeFollowers = total;
            }
          }
        } catch (err) {
          console.warn('Could not fetch authoritative followers count:', err);
        }

        const formattedProfileData = {
          name: userForProfile?.displayName || userForProfile?.username || "User",
          title: "Full Stack Developer",
          location: userForProfile?.location || "Unknown",
          joinDate: new Date((userForProfile as any)?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          bio: userForProfile?.bio || `Passionate developer building amazing applications and contributing to the community.`,
          avatar: userForProfile?.avatar || "/placeholder.svg",
          techStack: (userForProfile as any)?.techStack || ["JavaScript", "React", "Node.js", "TypeScript"],
          socialLinks: [
            { platform: "GitHub", icon: "Github", url: (userForProfile as any)?.githubUsername ? `https://github.com/${(userForProfile as any).githubUsername}` : "#" },
            { platform: "LinkedIn", icon: "Linkedin", url: (userForProfile as any)?.linkedinUrl || "#" },
            { platform: "Portfolio", icon: "Globe", url: (userForProfile as any)?.portfolioUrl || "#" }
          ].filter(link => link.url !== "#"),
          userId: (userForProfile as any)?._id || (userForProfile as any)?.id,
          username: userForProfile?.username,
          // Use authoritative followers count when available to avoid stale DB field
          followersCount: authoritativeFollowers || 0,
          followingCount: (userForProfile as any)?.followingCount || 0,
          isFollowing: false
        };
        setProfileData(formattedProfileData);

        // Fetch additional data like stats and activities in parallel
        const [statsResponse, activitiesResponse] = await Promise.all([
          fetch('/api/profile/stats'),
          fetch('/api/profile/activity?limit=10')
        ]);

        if (statsResponse.ok) {
          const { stats } = await statsResponse.json()
          setStatsData(stats)
        }

        if (activitiesResponse.ok) {
          const { activities } = await activitiesResponse.json()
          setActivitiesData(activities)
        }

      } catch (error) {
        console.error('Error fetching profile page data:', error)
      }
    }

    fetchPageData()
  }, [user, authLoading])

  const handlePrivacySettingsChange = (newSettings: any) => {
    console.log('Privacy settings updated:', newSettings)
  }

  const tabOptions = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'skills', label: 'Skills', icon: TrendingUp },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  if (authLoading) {
    return <ProfileSkeleton />
  }

  if (!user || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Please log in to view your profile.
        </p>
        <Button onClick={() => window.location.href = '/auth/login'}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full py-4 sm:py-6 px-1 sm:px-4 overflow-hidden">
      <ProfileHeader 
        profile={profileData} 
        onEdit={() => {}} 
        isOwnProfile={true} 
        setProfileData={setProfileData}
      />
      
      <div className="mt-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabOptions.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                }`}
              >
                <tab.icon className="inline-block w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <ProfileStats stats={statsData} />
            <ActivityFeed activities={activitiesData} />
          </div>
        )}
        {activeTab === 'activity' && <ActivityFeed activities={activitiesData} />}
        {/* The skillsData and privacySettings are not being fetched from the API, so I'm removing them for now. */}
        {/* {activeTab === 'skills' && skillsData && <SkillProgress skills={skillsData} />} */}
        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WalletBalanceDisplay />
            <TransactionHistory />
          </div>
        )}
        {/* {activeTab === 'privacy' && (
          <PrivacySettings
            settings={privacySettings}
            onSettingsChange={handlePrivacySettingsChange}
          />
        )} */}
      </div>
    </div>
  )
}