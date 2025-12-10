'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export default function TestPushPage() {
  const [status, setStatus] = useState<string>('')
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications()

  const handleSubscribe = async () => {
    setStatus('Subscribing...')
    const result = await subscribe()
    if (result.success) {
      setStatus('✅ Subscribed successfully!')
    } else {
      setStatus('❌ Failed to subscribe: ' + JSON.stringify(result.error))
    }
  }

  const handleUnsubscribe = async () => {
    setStatus('Unsubscribing...')
    const result = await unsubscribe()
    if (result.success) {
      setStatus('✅ Unsubscribed successfully!')
    } else {
      setStatus('❌ Failed to unsubscribe')
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Push Notification Test</h1>
      
      <Card className="p-6 space-y-4">
        <div>
          <p><strong>Browser Support:</strong> {isSupported ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Subscription Status:</strong> {isSubscribed ? '✅ Subscribed' : '❌ Not Subscribed'}</p>
          <p><strong>VAPID Key:</strong> {process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.substring(0, 30)}...</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubscribe} disabled={isSubscribed}>
            Subscribe to Push Notifications
          </Button>
          <Button onClick={handleUnsubscribe} variant="outline" disabled={!isSubscribed}>
            Unsubscribe
          </Button>
        </div>

        {status && (
          <div className="p-4 bg-muted rounded-md">
            <p className="whitespace-pre-wrap">{status}</p>
          </div>
        )}

        <div className="text-sm space-y-1">
          <p><strong>Debug Info:</strong></p>
          <p>Service Worker: {typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? '✅' : '❌'}</p>
          <p>Push Manager: {typeof window !== 'undefined' && 'PushManager' in window ? '✅' : '❌'}</p>
          <p>Notification API: {typeof Notification !== 'undefined' ? '✅' : '❌'}</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click &quot;Subscribe to Push Notifications&quot;</li>
          <li>Accept the browser permission when prompted</li>
          <li>Run: <code className="bg-muted px-2 py-1 rounded">pnpm tsx scripts/test-push-notification.ts</code></li>
          <li>You should receive a test notification!</li>
        </ol>
      </Card>
    </div>
  )
}
