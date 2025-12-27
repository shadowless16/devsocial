"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { MapPin, Calendar, Edit2, Trophy, Target, Users, MessageCircle, Loader2, Heart, FolderOpen, ListOrdered, Plus, BarChart3, TrendingUp, Activity as ActivityIcon } from 'lucide-react'
import { useAuth } from '@/contexts/app-context'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileStats from '@/components/profile/ProfileStats'
import AchievementShowcase from '@/components/profile/AchievementShowcase'
import ActivityFeed from '@/components/profile/ActivityFeed'
import SkillProgress from '@/components/profile/SkillProgress'
import { Post, ProfileData, UserSearchResult } from '@/types'
import { ProfileSkeleton } from '@/components/skeletons/profile-skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/user-avatar'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const EditProfileModal = dynamic(() => import('@/components/modals/edit-profile-modal'), {
  ssr: false
})

const SmartAvatar = dynamic(() => import('@/components/ui/smart-avatar').then(mod => ({ default: mod.SmartAvatar })), {
  ssr: false,
  loading: () => (
    <div className="w-20 h-20 border-4 border-white shadow-lg rounded-full bg-muted flex items-center justify-center">
      <span className="text-xl">...</span>
    </div>
  )
})

export default function MyProfile() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('posts')
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [userStats, setUserStats] = useState<{ totalXP?: number; challengesCompleted?: number; communityRank?: number; postsCreated?: number; totalLikes?: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers')
  const [followData, setFollowData] = useState<UserSearchResult[]>([])
  const [loadingFollowData, setLoadingFollowData] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const fetchUserPosts = useCallback(async (pageNum: number, reset = false) => {
    try {
      if (!reset) {
        setLoadingMore(true)
      }
      
      const response = await fetch(`/api/posts?authorId=${user.id}&limit=50&page=${pageNum}`)
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data?.posts) {
          const fetchedPosts = result.data.posts;
          
          if (reset) {
            setUserPosts(fetchedPosts)
          } else {
            setUserPosts(prev => {
              const existingIds = new Set(prev.map(p => p._id || p.id));
              const uniqueNewPosts = fetchedPosts.filter((p: any) => !existingIds.has(p._id || p.id));
              return [...prev, ...uniqueNewPosts];
            })
          }
          
          setHasMore(fetchedPosts.length === 50)
          setPage(pageNum)
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching user posts:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [user])

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch('/api/users/profile'),
        fetch('/api/profile/stats')
      ])

      if (profileRes.ok) {
        const { data } = await profileRes.json()
        setProfileData({
          ...data.user,
          name: data.user?.displayName || data.user?.username || "User",
          joinDate: new Date(data.user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        })
      }

      if (statsRes.ok) {
        const { stats } = await statsRes.json()
        setUserStats(stats)
      }

      // Fetch initial posts
      await fetchUserPosts(1, true)
    } catch (error: unknown) {
      console.error('Error fetching profile data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchUserPosts])

  useEffect(() => {
    if (authLoading || !user) return
    fetchInitialData()
  }, [user, authLoading, fetchInitialData])

  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || loadingMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchUserPosts(page + 1)
      }
    })
    if (node) observer.current?.observe(node)
  }, [isLoading, loadingMore, hasMore, page, fetchUserPosts])

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`)
  }

  const handleShowFollowModal = async (type: 'followers' | 'following') => {
    setFollowModalType(type)
    setShowFollowModal(true)
    setLoadingFollowData(true)
    
    try {
      const endpoint = type === 'followers' 
        ? `/api/users/${profileData?.username}/followers`
        : `/api/users/${profileData?.username}/following`
      
      const response = await fetch(endpoint)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const list = type === 'followers' ? result.data.followers : result.data.following
          setFollowData(list || [])
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching follow data:', error)
    } finally {
      setLoadingFollowData(false)
    }
  }

  const tabs = [
    { id: 'posts', label: 'Timeline', count: userPosts.length, icon: ActivityIcon },
    { id: 'stats', label: 'Insights', count: 0, icon: TrendingUp },
    { id: 'projects', label: 'Projects', count: 0, icon: FolderOpen },
    { id: 'missions', label: 'Missions', count: 3, icon: ListOrdered },
  ]

  if (authLoading || isLoading) {
    return <ProfileSkeleton />
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Please log in to view your profile.
        </p>
        <Button onClick={() => window.location.href = '/auth/login'}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-24 pb-24 animate-in fade-in duration-1000">
      {/* 1. High-Impact Header Section */}
      <section className="relative">
        <ProfileHeader 
          profile={{
            ...profileData!,
            name: profileData?.name || user?.username || 'User',
            title: profileData?.title || "System Engineer",
            location: profileData?.location || "Not specified",
            joinDate: profileData?.joinDate || "Member since 2024",
            bio: profileData?.bio || "",
            techStack: profileData?.techStack || [],
            userId: user.id,
            username: user.username,
            followersCount: profileData?.followersCount || 0,
            followingCount: profileData?.followingCount || 0,
            isFollowing: false,
            xp: profileData?.points || 0
          }} 
          onEdit={() => setShowEditModal(true)} 
          isOwnProfile={true}
          setProfileData={(data: any) => setProfileData(prev => ({ ...prev, ...data } as ProfileData))}
        />
      </section>

      {/* 2. Integrated Insights Row (Full Width) */}
      <section className="max-w-7xl mx-auto px-6">
        <ProfileStats stats={{
            totalXP: profileData?.points || 0,
            challengesCompleted: userStats?.challengesCompleted || 0,
            communityRank: userStats?.communityRank || 999,
            postsCreated: userPosts.length
          }} 
        />
      </section>

      {/* 3. Navigation & Intelligence Stage */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16">
          
          {/* Main Execution Content (Timeline/Achievements) */}
          <main className="lg:col-span-8 space-y-20">
            {/* Minimalist Tabs */}
            <nav className="flex items-center gap-12 border-b border-foreground/5 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative py-2 text-sm font-black tracking-widest uppercase transition-all ${
                    activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-[18px] left-0 right-0 h-1 bg-primary rounded-full animate-in zoom-in-50 duration-500" />
                  )}
                </button>
              ))}
            </nav>

            <div className="min-h-[500px]">
              {activeTab === 'posts' && (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between">
                     <h2 className="text-3xl font-black text-foreground tracking-tighter">Personal Timeline</h2>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="font-bold text-xs"
                       onClick={() => window.location.href = '/home'}
                     >
                       CREATE NEW POST
                     </Button>
                  </div>
                  <ActivityFeed 
                    activities={userPosts.map(post => ({
                      id: post._id || post.id,
                      type: 'post',
                      title: 'Public Broadcast',
                      description: post.content, // Show full content
                      content: post.content,
                      timestamp: new Date(post.createdAt).toLocaleString(),
                      engagement: {
                        likes: post.likesCount || 0,
                        comments: post.commentsCount || 0,
                        shares: 0
                      }
                    }))}
                    lastItemRef={lastPostElementRef}
                    onLike={async (id) => {
                      const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
                      const result = await res.json();
                      if (result.success) {
                        setUserPosts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, likesCount: result.likesCount } : p));
                      }
                    }}
                    onComment={(id) => router.push(`/post/${id}`)}
                  />
                  
                  {loadingMore && (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <h2 className="text-3xl font-black text-foreground tracking-tighter">Advanced Analytics</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 bg-foreground/5 rounded-3xl border border-foreground/5">
                        <BarChart3 className="mb-4 text-indigo-500" />
                        <h3 className="text-xl font-bold mb-2">Growth Vector</h3>
                        <p className="text-sm text-muted-foreground">Detailed XP accumulation over the last 30 intervals.</p>
                     </div>
                     <div className="p-8 bg-foreground/5 rounded-3xl border border-foreground/5">
                        <Users className="mb-4 text-emerald-500" />
                        <h3 className="text-xl font-bold mb-2">Network Strength</h3>
                        <p className="text-sm text-muted-foreground">Analysis of follower reach and engagement coefficients.</p>
                     </div>
                   </div>
                </div>
              )}
            </div>
          </main>

          {/* Side Context (Matrix/Missions) */}
          <aside className="lg:col-span-4 space-y-20">
            <section className="space-y-10">
              <h3 className="text-xs font-black text-muted-foreground tracking-[0.3em] uppercase">Visual Mastery</h3>
              <div className="p-8 bg-foreground/5 rounded-[40px] border border-foreground/5 backdrop-blur-3xl">
                <SkillProgress skills={[]} /> {/* Pass relevant skills if available */}
              </div>
            </section>

            <section className="space-y-10">
              <h3 className="text-xs font-black text-muted-foreground tracking-[0.3em] uppercase">Active Missions</h3>
              <div className="space-y-6">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-foreground/5 shadow-sm">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Target size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">System Architect</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">75% COMPLETE</p>
                      </div>
                   </div>
                   <div className="w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-indigo-500" />
                   </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {showEditModal && profileData && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profileData}
          onSave={(data: any) => {
            setProfileData((prev) => {
              if (!prev) return null
              return { 
                ...prev, 
                ...data,
                name: (data.displayName as string) || prev.name,
                avatar: (data.avatar as string) || prev.avatar,
                bannerUrl: (data.bannerUrl as string) || prev.bannerUrl
              } as ProfileData
            })
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}