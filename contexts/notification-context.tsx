"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAsUnread: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshUnreadCount: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications?limit=50')
      const data = await response.json()
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?unread=true&limit=1')
      const data = await response.json()
      if (data.success) {
        setUnreadCount(data.data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
      setUnreadCount(0)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAsUnread = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-unread', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: false } : n)
        )
        setUnreadCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  useEffect(() => {
    refreshUnreadCount()
    // Also fetch notifications on mount to get initial data
    fetchNotifications()
    const interval = setInterval(refreshUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      refreshUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}