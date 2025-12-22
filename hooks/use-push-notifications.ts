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
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey || vapidPublicKey.includes('YOUR_NEW_PUBLIC_KEY_HERE')) {
        console.warn('[Push] VAPID keys not configured properly')
        setIsSupported(false)
        return
      }
      
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
      if (!vapidPublicKey || vapidPublicKey.includes('YOUR_NEW_PUBLIC_KEY_HERE')) {
        console.warn('[Push] VAPID keys not configured properly')
        return { success: false, error: 'Push notifications not configured' }
      }

      console.log('[Push] VAPID key length:', vapidPublicKey.length)
      console.log('[Push] VAPID key prefix:', vapidPublicKey.substring(0, 10))

      let registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        await navigator.serviceWorker.ready
      }

      try {
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey)
        
        console.log('[Push] Converted key length:', convertedKey.length)
        
        if (convertedKey.length !== 65) {
          console.error('[Push] Invalid VAPID key format. Expected 65 bytes, got:', convertedKey.length)
          return { success: false, error: 'Invalid VAPID key configuration' }
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
          throw new Error('Failed to save subscription')
        }

        setSubscription(sub)
        setIsSubscribed(true)
        return { success: true }
      } catch (pushError) {
        console.error('[Push] Subscription failed:', pushError)
        return { 
          success: false, 
          error: 'Push notifications unavailable. Please check browser settings or try again later.' 
        }
      }
    } catch (error) {
      console.error('[Push] Error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to enable notifications' 
      }
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
