"use client"

import { useState } from "react"
import { Bell, X, Heart, MessageCircle, UserPlus, Trophy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  type: "like" | "comment" | "mention" | "follow" | "achievement" | "system"
  title: string
  message: string
  avatar?: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    title: "Sarah Code boosted your post",
    message: "Your post about TypeScript got a new boost!",
    avatar: "/placeholder.svg?height=32&width=32",
    timestamp: "2 minutes ago",
    isRead: false,
  },
  {
    id: "2",
    type: "comment",
    title: "Alex Chen contributed to your post",
    message: "Great explanation! I've been looking for this...",
    avatar: "/placeholder.svg?height=32&width=32",
    timestamp: "15 minutes ago",
    isRead: false,
  },
  {
    id: "3",
    type: "mention",
    title: "You were mentioned in a post",
    message: "@johndev what do you think about this approach?",
    avatar: "/placeholder.svg?height=32&width=32",
    timestamp: "1 hour ago",
    isRead: false,
  },
  {
    id: "4",
    type: "follow",
    title: "Dev Mike connected with you",
    message: "You have a new connection!",
    avatar: "/placeholder.svg?height=32&width=32",
    timestamp: "2 hours ago",
    isRead: true,
  },
  {
    id: "5",
    type: "achievement",
    title: "Achievement Unlocked!",
    message: "You&apos;ve earned the 'Network Builder' badge for getting 50 boosts!",
    timestamp: "1 day ago",
    isRead: true,
  },
  {
    id: "6",
    type: "system",
    title: "Weekly Mission Available",
    message: "A new coding mission is now available. Complete it to earn 200 XP!",
    timestamp: "2 days ago",
    isRead: true,
  },
]

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState(mockNotifications)

  if (!isOpen) return null

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "mention":
        return <MessageCircle className="w-4 h-4 text-purple-500" />
      case "follow":
        return <UserPlus className="w-4 h-4 text-green-500" />
      case "achievement":
        return <Trophy className="w-4 h-4 text-yellow-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16 z-50 lg:items-center lg:pt-0">
      <Card className="w-full max-w-md mx-4 max-h-[80vh] overflow-hidden lg:max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && <Badge className="bg-red-500 text-white text-xs px-2 py-1">{unreadCount}</Badge>}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {notification.avatar ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">{notification.title}</p>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.timestamp}</p>
                        </div>

                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 h-auto"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 h-auto text-gray-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
