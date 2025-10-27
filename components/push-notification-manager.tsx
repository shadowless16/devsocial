'use client'

import { useEffect, useState } from 'react'
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
    if (!session?.user) return
    setLoading(true)

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Please enable notifications in your browser settings')
        setLoading(false)
        return
      }

      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub })
      })

      setSubscription(sub)
    } catch (error) {
      console.error('Subscribe error:', error)
    }
    setLoading(false)
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      await subscription?.unsubscribe()
      await fetch('/api/notifications/unsubscribe', { method: 'POST' })
      setSubscription(null)
    } catch (error) {
      console.error('Unsubscribe error:', error)
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
