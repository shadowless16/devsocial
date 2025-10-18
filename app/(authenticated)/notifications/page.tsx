"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCheck, Bell, MoreHorizontal, Heart, MessageCircle, UserPlus, Star, AtSign, AlertCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useNotifications } from '@/contexts/notification-context'

function TimeAgo({ timestamp }: { timestamp: string }) {
  const [time, setTime] = useState(() => formatDistanceToNow(new Date(timestamp), { addSuffix: true }))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatDistanceToNow(new Date(timestamp), { addSuffix: true }))
    }, 60000)
    return () => clearInterval(interval)
  }, [timestamp])

  return <span className="flex-shrink-0">{time}</span>
}

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
  sender: {
    _id: string
    username: string
    displayName: string
    avatar?: string
    level: number
  }
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { notifications, loading, fetchNotifications, markAsRead, markAsUnread, markAllAsRead } = useNotifications()
  const [filteredNotifications, setFilteredNotifications] = useState(notifications)
  const [, setTick] = useState(0)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => {
      fetchNotifications()
    }, 1800000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (filter === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.read))
    } else {
      setFilteredNotifications(notifications)
    }
  }, [notifications, filter])

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-3 w-3"
    switch (type) {
      case 'like': return <Heart className={`${iconClass} text-red-500 fill-red-500`} />
      case 'comment': return <MessageCircle className={`${iconClass} text-blue-500`} />
      case 'follow': return <UserPlus className={`${iconClass} text-green-500`} />
      case 'project_like': return <Star className={`${iconClass} text-yellow-500 fill-yellow-500`} />
      case 'mention': return <AtSign className={`${iconClass} text-purple-500`} />
      case 'system': return <Bell className={`${iconClass} text-gray-500`} />
      default: return <AlertCircle className={`${iconClass} text-gray-500`} />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 text-sm md:text-base mt-1 md:mt-2">Stay updated with your activity</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="sm:ml-auto">
            <CheckCheck className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Mark all read</span>
            <span className="sm:hidden">Mark read</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'All caught up! Check back later for new updates.'
                  : 'When you get notifications, they\'ll show up here.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-colors ${
                !notification.read 
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage src={notification.sender.avatar} />
                      <AvatarFallback className="text-xs">
                        {(notification.sender.displayName || notification.sender.username)[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 border border-gray-200 dark:border-gray-700">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="truncate">
                            From {notification.sender.displayName || notification.sender.username}
                          </span>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            L{notification.sender.level}
                          </Badge>
                          <TimeAgo timestamp={notification.createdAt} />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {notification.actionUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-shrink-0 text-xs px-2" 
                            asChild
                            onClick={() => !notification.read && markAsRead(notification._id)}
                          >
                            <Link href={notification.actionUrl}>
                              View
                            </Link>
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {notification.read ? (
                              <DropdownMenuItem onClick={() => markAsUnread(notification._id)}>
                                Mark as unread
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => markAsRead(notification._id)}>
                                Mark as read
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}