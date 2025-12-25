'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

export default function PushNotificationManager() {
  const { data: session } = useSession()
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  const subscribe = async () => {
    console.log('[PushManager] Subscribe clicked');

    setLoading(true)

    try {
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        alert('Please enable notifications in your browser settings')
        setLoading(false)
        return
      }

      const registration = await navigator.serviceWorker.ready
      const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)

      // Force unsubscribe from existing to clear stale state
      const existingSub = await registration.pushManager.getSubscription()
      if (existingSub) {
        console.log('[PushManager] Clearing existing subscription...')
        await existingSub.unsubscribe()
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      })

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription to server')
      }

      setSubscription(sub)
    } catch (error) {
      console.error('Push subscription failed:', error)
      
      // Fallback ONLY for localhost testing
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('Using localhost fallback')
        try {
          const mockSub = {
            endpoint: 'http://localhost:3000/mock-push',
            keys: {
              p256dh: 'mock-key',
              auth: 'mock-auth'
            }
          }
          
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockSub)
          })
          
          setSubscription(mockSub as any)
        } catch (mockErr) {
           console.error('Fallback failed', mockErr)
        }
      } else {
        // Production error handling
        alert('Failed to enable notifications. Please check console for details (likely missing VAPID keys or permission denied).')
      }
    }
    setLoading(false)
  }

  const unsubscribe = async () => {
    console.log('[PushManager] Unsubscribe clicked');
    setLoading(true)
    try {
      if (subscription) {
        console.log('[PushManager] Unsubscribing from browser...');
        await subscription.unsubscribe()
      }
      console.log('[PushManager] Notifying server of unsubscribe...');
      await fetch('/api/notifications/unsubscribe', { method: 'POST' })
      setSubscription(null)
      console.log('[PushManager] Unsubscribe complete');
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Unsubscribe error:', errorMessage)
    }
    setLoading(false)
  }

  const handleRepair = async () => {
    if (!confirm('This will reset all push notification settings for this browser. Continue?')) {
      return
    }
    setLoading(true)
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const reg of registrations) {
        await reg.unregister()
      }
      setSubscription(null)
      alert('Notification settings reset. Please refresh and try enabling again.')
      window.location.reload()
    } catch (error) {
      console.error('Repair failed:', error)
      alert('Repair failed. Please clear browser storage manually.')
    }
    setLoading(false)
  }

  if (!isSupported || !session) return null

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        className="shadow-md bg-background/80 backdrop-blur-sm"
        onClick={subscription ? unsubscribe : subscribe}
        disabled={loading}
      >
        {subscription ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        <span className="ml-2">{subscription ? 'Notifications On' : 'Enable Notifications'}</span>
      </Button>
      
      {!subscription && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm self-end"
          onClick={handleRepair}
          title="Fix / Reset Notifications"
          disabled={loading}
        >
          <BellOff className="h-4 w-4 text-muted-foreground opacity-50" />
        </Button>
      )}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
