"use client"

import { useEffect } from 'react'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { Check, CheckCheck, Bell, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/contexts/notification-context'
import { UserLink } from '@/components/shared/UserLink'

export function NotificationList() {
  const router = useRouter()
  const { notifications, loading, fetchNotifications, markAsRead, markAsUnread, markAllAsRead } = useNotifications()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️'
      case 'comment': return '💬'
      case 'follow': return '👤'
      case 'project_like': return '⭐'
      case 'mention': return '@'
      case 'system': return '🔔'
      default: return '📢'
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-96">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
          <CheckCheck className="h-4 w-4 mr-1" />
          Mark all read
        </Button>
      </div>
      
      <ScrollArea className="max-h-80">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                  !notification.read ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''
                }`}
                onClick={() => {
                  if (notification.actionUrl) {
                    if (!notification.read) markAsRead(notification._id)
                    router.push(notification.actionUrl)
                  }
                }}
              >
                <div 
                  className="relative cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/profile/${notification.sender.username}`)
                  }}
                >
                  <UserAvatar 
                    user={{
                      username: notification.sender.username || '',
                      avatar: notification.sender.avatar,
                      displayName: notification.sender.displayName
                    }}
                    className="h-8 w-8"
                  />
                  <div className="absolute -bottom-1 -right-1 text-xs">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3 w-3" />
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
            ))}
          </div>
        )}
      </ScrollArea>
      
      {notifications.length > 0 && (
        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/notifications">
              View all notifications
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}