"use client"

import React, { useState } from 'react'
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
  type: 'post' | 'challenge' | 'comment' | 'like' | 'share'
  title: string
  description: string
  content?: string
  timestamp: string
  xpEarned?: number
  engagement?: ActivityEngagement
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
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
    <Card className="w-full max-w-full overflow-hidden">
      <CardContent className="p-3 max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-2 max-w-full overflow-hidden">
          <h2 className="text-sm font-semibold text-foreground truncate">Recent Activity</h2>
          <Clock size={16} className="text-muted-foreground flex-shrink-0" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-hide">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(option.value)}
              className="whitespace-nowrap flex-shrink-0"
            >
              <option.icon size={12} className="mr-1" />
              {option.label}
            </Button>
          ))}
        </div>

        {/* Activity Timeline */}
        <div className="space-y-2 max-h-48 overflow-y-auto max-w-full">
          {filteredActivities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type)
            return (
              <div
                key={index}
                className="flex gap-1.5 p-1.5 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer w-full max-w-full overflow-hidden"
              >
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <IconComponent 
                    size={10} 
                    className={getActivityColor(activity.type)}
                  />
                </div>
                
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-start justify-between gap-2 max-w-full overflow-hidden">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-xs text-foreground font-medium truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 break-words">
                        {activity.description}
                      </p>
                      
                      {activity.content && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground break-words overflow-hidden">
                          {activity.content}
                        </div>
                      )}
                      
                      {activity.xpEarned && (
                        <div className="flex items-center gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            +{activity.xpEarned} XP
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {activity.timestamp}
                    </div>
                  </div>
                  
                  {activity.engagement && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground overflow-x-auto">
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Heart size={12} />
                        <span>{activity.engagement.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <MessageCircle size={12} />
                        <span>{activity.engagement.comments}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Share2 size={12} />
                        <span>{activity.engagement.shares}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-4">
            <Activity size={24} className="text-muted-foreground mx-auto mb-1" />
            <p className="text-muted-foreground">No activities found for this filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}