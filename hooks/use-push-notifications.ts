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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error checking subscription:', errorMessage)
    }
  }

  const subscribe = async () => {
    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured')
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub })
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setSubscription(sub)
      setIsSubscribed(true)
      return { success: true }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error subscribing to push notifications:', errorMessage)
      return { success: false, error: error.message || String(error) }
    }
  }

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe()
        
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST'
        })

        setSubscription(null)
        setIsSubscribed(false)
      }
      return { success: true }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error unsubscribing from push notifications:', errorMessage)
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
