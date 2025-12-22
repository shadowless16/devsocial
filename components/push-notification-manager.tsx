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
    console.log('[PushManager] Mounted. VAPID Key preset:', !!VAPID_PUBLIC_KEY);
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.getSubscription()
    console.log('[PushManager] Initial check. Existing subscription:', sub ? 'YES' : 'NO');
    setSubscription(sub)
  }

  const subscribe = async () => {
    console.log('[PushManager] Subscribe clicked');
    if (!session?.user) {
      console.error('[PushManager] No user session found');
      return;
    }
    setLoading(true)

    try {
      console.log('[PushManager] Requesting notification permission...');
      const permission = await Notification.requestPermission()
      console.log('[PushManager] Permission status:', permission);
      
      if (permission !== 'granted') {
        alert('Please enable notifications in your browser settings')
        setLoading(false)
        return
      }

      console.log('[PushManager] Waiting for Service Worker ready...');
      const registration = await navigator.serviceWorker.ready
      console.log('[PushManager] SW Ready. Subscribing with key length:', VAPID_PUBLIC_KEY.length);
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
      console.log('[PushManager] Got PushSubscription from browser:', JSON.stringify(sub));

      console.log('Sending subscription to server:', JSON.stringify(sub));
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

  if (!isSupported || !session) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={subscription ? unsubscribe : subscribe}
      disabled={loading}
    >
      {subscription ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      <span className="ml-2">{subscription ? 'Notifications On' : 'Enable Notifications'}</span>
    </Button>
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
