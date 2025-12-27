// @ts-nocheck
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { User, Activity, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/app-context'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileStats from '@/components/profile/ProfileStats'
import AchievementShowcase from '@/components/profile/AchievementShowcase'
import ActivityFeed from '@/components/profile/ActivityFeed'
import SkillProgress from '@/components/profile/SkillProgress'

export default function UserProfile() {
  const router = useRouter()
  const params = useParams()
  const username = params.username as string
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [profileData, setProfileData] = useState<unknown>(null)
  const [statsData, setStatsData] = useState<unknown>(null)
  const [activitiesData, setActivitiesData] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const observer = React.useRef<IntersectionObserver | null>(null)

  const fetchUserPosts = React.useCallback(async (pageNum: number, userId: string, reset = false) => {
    try {
      if (!reset) setLoadingMore(true)
      const res = await fetch(`/api/posts?authorId=${userId}&limit=20&page=${pageNum}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data?.posts) {
          const fetchedPosts = result.data.posts.map((post: any) => ({
            id: post.id || post._id,
            type: 'post',
            title: post.title || 'Public Broadcast',
            description: post.content || post.body || post.text || post.excerpt || post.summary || '',
            content: post.content || post.body || post.text || '',
            timestamp: post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Unknown',
            xpEarned: post.xpAwarded || post.xp || undefined,
            isLiked: post.isLiked || false,
            engagement: {
              likes: post.likesCount || post.likes || 0,
              comments: post.commentsCount || post.comments || 0,
              shares: post.shares || 0
            }
          }))

          if (reset) {
            setActivitiesData(fetchedPosts)
          } else {
            setActivitiesData(prev => {
              const existingIds = new Set(prev.map((a: any) => a.id))
              const unique = fetchedPosts.filter((a: any) => !existingIds.has(a.id))
              return [...prev, ...unique]
            })
          }
          setHasMore(result.data.posts.length === 20)
          setPage(pageNum)
        }
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      if (!reset) setLoadingMore(false)
    }
  }, [])

  const lastPostElementRef = React.useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore || !profileData?.userId) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchUserPosts(page + 1, profileData.userId)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, loadingMore, hasMore, page, fetchUserPosts, profileData?.userId])

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!username || !currentUser) return

        // Check if viewing own profile
        if (currentUser.username === username) {
          router.push('/profile')
          return
        }

        // Fetch user data
        const userResponse = await fetch(`/api/users/${username}`)
        
        if (!userResponse.ok) {
          throw new Error('User not found')
        }
        
        const userData = await userResponse.json()
        const user = userData.data.user
        
        const profile = {
          name: user.displayName || user.username,
          title: "System Developer",
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
          isFollowing: user.isFollowing || false,
          xp: user.points || 0,
          level: user.level || 1,
          loginStreak: user.loginStreak || 0,
          badges: user.badges || []
        }
        
        setProfileData(profile)
        setStatsData({
          totalXP: user.points || 0,
          challengesCompleted: 0,
          communityRank: user.rank || 999,
          postsCreated: user.stats?.totalPosts || 0
        })
        
        // Initial fetch of posts using shared function
        await fetchUserPosts(1, user._id, true)

      } catch (error: unknown) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [username, currentUser, router, fetchUserPosts])

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        setActivitiesData(prev => prev.map(activity => {
          if (activity.id === postId) {
            return {
              ...activity,
              isLiked: result.liked,
              engagement: {
                ...activity.engagement,
                likes: result.likesCount
              }
            }
          }
          return activity
        }))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const achievementsData = {
    badges: [],
    missions: [],
    certifications: []
  }

  const skillsData: unknown[] = []

  const tabOptions = [
    { id: 'overview', label: 'Insights', icon: TrendingUp },
    { id: 'activity', label: 'Timeline', icon: Activity },
    { id: 'skills', label: 'Matrix', icon: User }
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
          <p className="text-gray-600">The user you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-16 px-8 space-y-24">
      <section className="animate-in fade-in slide-in-from-top-4 duration-1000">
        <ProfileHeader 
          profile={profileData} 
          onEdit={() => {}} 
          isOwnProfile={false} 
          setProfileData={setProfileData}
        />
      </section>
      
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-10 ml-1 opacity-50">
          Pulse & Performance
        </h3>
        {statsData && <ProfileStats stats={statsData} />}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-20">
          <div className="flex items-center space-x-12 border-b border-foreground/[0.03] pb-6">
            {tabOptions.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-6 text-sm font-black transition-all group ${
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/70'
                }`}
              >
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-500 rounded-full shadow-[0_4px_12px_rgba(99,102,241,0.4)]" />
                )}
                <div className="flex items-center space-x-3">
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-indigo-500' : 'group-hover:text-indigo-500/50 transition-colors'} />
                  <span className="tracking-tight">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="min-h-[600px]">
             {activeTab === 'overview' && (
               <div className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 <div className="space-y-10">
                   <h2 className="text-3xl font-black text-foreground tracking-tighter">Strategic Insights</h2>
                   <ActivityFeed 
                     activities={activitiesData.slice(0, 3)} 
                     onLike={handleLike}
                     onComment={(id) => router.push(`/post/${id}`)}
                   />
                 </div>
                 
                 <div className="space-y-10">
                   <h2 className="text-3xl font-black text-foreground tracking-tighter">Honors & Notable Feats</h2>
                   <AchievementShowcase achievements={achievementsData} />
                 </div>
               </div>
             )}

             {activeTab === 'activity' && (
               <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 <h2 className="text-3xl font-black text-foreground tracking-tighter mb-10">Historical Timeline</h2>
                 <ActivityFeed 
                   activities={activitiesData} 
                   lastItemRef={lastPostElementRef}
                   onLike={handleLike}
                   onComment={(id) => router.push(`/post/${id}`)}
                 />
                 {loadingMore && (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
               </div>
             )}

             {activeTab === 'skills' && (
               <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 <h2 className="text-3xl font-black text-foreground tracking-tighter mb-10">Technical Skill Matrix</h2>
                 <SkillProgress skills={skillsData} />
               </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-4 order-1 lg:order-2 space-y-10">
          <section className="sticky top-12">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-10 ml-1 opacity-50">
              Skill Acquisition
            </h3>
            <SkillProgress skills={skillsData.slice(0, 4)} />
          </section>
        </div>
      </div>
    </div>
  )
}