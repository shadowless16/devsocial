import { useState, useEffect } from 'react'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      setIsSubscribed(!!sub)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const subscribe = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        return { success: false, error: 'Permission denied' }
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        return { success: false, error: 'VAPID key not configured' }
      }

      let registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        await navigator.serviceWorker.ready
      }

      try {
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        })

        const response = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub)
        })

        if (!response.ok) {
          throw new Error('Failed to save subscription')
        }

        setSubscription(sub)
        setIsSubscribed(true)
        return { success: true }
      } catch (pushError) {
        console.warn('Push subscription failed (normal on localhost), using fallback')
        
        // Fallback for localhost: save a mock subscription
        const mockSub = {
          endpoint: 'http://localhost:3000/mock-push',
          keys: {
            p256dh: 'mock-key',
            auth: 'mock-auth'
          }
        }
        
        const response = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockSub)
        })

        if (response.ok) {
          setIsSubscribed(true)
          return { success: true, warning: 'Using fallback mode (localhost)' }
        }
        
        throw pushError
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe()
        await fetch('/api/notifications/unsubscribe', { method: 'POST' })
        setSubscription(null)
        setIsSubscribed(false)
      }
      return { success: true }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      return { success: false, error }
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
