"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Activity, FileText, Target, MessageCircle, Heart, Share2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ActivityEngagement {
  likes: number
  comments: number
  shares: number
}

interface ActivityItem {
  id?: string
  type: 'post' | 'challenge' | 'comment' | 'like' | 'share'
  title: string
  description: string
  content?: string
  timestamp: string
  xpEarned?: number
  engagement?: ActivityEngagement
  isLiked?: boolean
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  onLike?: (id: string) => void
  onComment?: (id: string) => void
  onShare?: (id: string) => void
  lastItemRef?: (node: HTMLDivElement) => void
}

export default function ActivityFeed({ activities, onLike, onComment, onShare, lastItemRef }: ActivityFeedProps) {
  const router = useRouter()
  const [filter, setFilter] = useState('all')

  const filterOptions = [
  { value: 'all', label: 'All Activity', icon: Activity },
  { value: 'post', label: 'Posts', icon: FileText },
  { value: 'challenge', label: 'Challenges', icon: Target },
  { value: 'comment', label: 'Comments', icon: MessageCircle }
  ]

  const getActivityIcon = (type: string) => {
    const t = (type || '').toLowerCase()
    if (t.includes('post')) return FileText
    if (t.includes('challenge')) return Target
    if (t.includes('comment')) return MessageCircle
    if (t.includes('like')) return Heart
    if (t.includes('share')) return Share2
    return Activity
  }

  const getActivityColor = (type: string) => {
    const t = (type || '').toLowerCase()
    if (t.includes('post')) return 'text-blue-600'
    if (t.includes('challenge')) return 'text-green-600'
    if (t.includes('comment')) return 'text-purple-600'
    if (t.includes('like')) return 'text-red-600'
    if (t.includes('share')) return 'text-orange-600'
    return 'text-muted-foreground'
  }

  const activityMatchesFilter = (activityType: string, f: string) => {
    if (!f || f === 'all') return true
    const t = (activityType || '').toLowerCase()
    switch (f) {
      case 'post':
        return t.includes('post')
      case 'challenge':
        return t.includes('challenge')
      case 'comment':
        return t.includes('comment')
      default:
        return t === f
    }
  }

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(activity => activityMatchesFilter(activity.type, filter))

  return (
    <div className="w-full space-y-8">
      {/* Filter Tabs - Pill Styles */}
      <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl w-fit">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === option.value
                ? 'bg-white dark:bg-slate-900 text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground/70'
            }`}
          >
            <option.icon size={14} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-foreground/10">
        {filteredActivities.map((activity, index) => {
          const IconComponent = getActivityIcon(activity.type)
          return (
            <div
              key={index}
              ref={index === filteredActivities.length - 1 ? lastItemRef : null}
              className="relative group animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Dot Icon */}
              <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center z-10 ${getActivityColor(activity.type).replace('text-', 'bg-')}`}>
                 <IconComponent size={10} className="text-white" />
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 
                    className="text-base font-bold text-foreground hover:text-indigo-500 transition-colors cursor-pointer"
                    onClick={() => activity.id && router.push(`/post/${activity.id}`)}
                  >
                    {activity.title}
                  </h4>
                  <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                    {activity.timestamp}
                  </span>
                </div>
                <div 
                  className="cursor-pointer group/content"
                  onClick={() => activity.id && router.push(`/post/${activity.id}`)}
                >
                  <p className="text-sm text-foreground/70 leading-relaxed max-w-3xl group-hover/content:text-foreground transition-colors">
                    {activity.description}
                  </p>
                  
                  {activity.content && activity.content !== activity.description && (
                    <div className="p-4 mt-3 bg-muted/30 rounded-2xl border border-foreground/5 text-sm text-foreground/60 italic leading-relaxed">
                      &ldquo;{activity.content}&rdquo;
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6 pt-1">
                  {activity.xpEarned && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <Target size={12} />
                      +{activity.xpEarned} XP
                    </div>
                  )}

                  {activity.engagement && (
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onLike?.(activity.id || '');
                        }}
                        className={`flex items-center gap-1.5 transition-colors ${activity.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                      >
                        <Heart size={14} className={activity.isLiked ? 'fill-red-500 text-red-500' : ''} />
                        <span>{activity.engagement.likes}</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onComment?.(activity.id || '');
                        }}
                        className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors"
                      >
                        <MessageCircle size={14} />
                        <span>{activity.engagement.comments}</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare?.(activity.id || '');
                        }}
                        className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
                      >
                        <Share2 size={14} />
                        <span>{activity.engagement.shares}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filteredActivities.length === 0 && (
          <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-foreground/10">
            <Activity size={32} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No system events matching this criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}