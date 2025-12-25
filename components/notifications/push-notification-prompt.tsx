'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const { isSupported, isSubscribed, subscribe } = usePushNotifications()

  useEffect(() => {
    // Push notifications disabled due to browser push service limitations
    // Browser push services reject subscriptions from *.vercel.app domains
    // even when using Cloudflare Workers as the backend
    // Re-enable only when using a custom domain
    return
  }, [isSupported, isSubscribed])

  const handleEnable = async () => {
    const result = await subscribe()
    if (result.success) {
      setShowPrompt(false)
    } else if (result.error) {
      alert(result.error)
    }
  }

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('push-notification-dismissed', 'true')
    }
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 max-w-sm shadow-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Enable Push Notifications</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get notified when someone overtakes you in XP or when you overtake others!
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEnable}>
              Enable
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
