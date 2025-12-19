"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '@/lib/api/api-client'

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
      const response = await apiClient.request<any>('/notifications?limit=50')
      if (response.success && response.data) {
        setNotifications(response.data.notifications || [])
        setUnreadCount(response.data.unreadCount || 0)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Error fetching notifications:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const refreshUnreadCount = async () => {
    try {
      const response = await apiClient.request<any>('/notifications?unread=true&limit=1')
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount || 0)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Error fetching unread count:', errorMessage)
      setUnreadCount(0)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await apiClient.request<any>('/notifications/mark-read', {
        method: 'PUT', // Fixed to PUT as supported by backend
        body: JSON.stringify({ notificationIds: [notificationId] })
      })
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Error marking notification as read:', errorMessage)
    }
  }

  const markAsUnread = async (notificationId: string) => {
    try {
      const response = await apiClient.request<any>('/notifications/mark-unread', {
        method: 'PUT',
        body: JSON.stringify({ notificationIds: [notificationId] })
      })
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: false } : n)
        )
        setUnreadCount(prev => prev + 1)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Error marking notification as unread:', errorMessage)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await apiClient.request<any>('/notifications/mark-all-read', {
        method: 'POST'
      })
      
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error('Error marking all notifications as read:', errorMessage)
    }
  }

  useEffect(() => {
    refreshUnreadCount()
    // Poll less frequently to reduce server load
    const interval = setInterval(refreshUnreadCount, 120000) // 2 minutes instead of 30 seconds
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