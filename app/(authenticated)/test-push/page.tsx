'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestPushPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'GET'
      })
      if (response.ok) {
        const data = await response.json()
        setHasSubscription(!!data.subscription)
      }
    } catch (error) {
      console.error('Check failed:', error)
    }
  }

  const testNotification = async (type: string) => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResult(`✅ ${type} notification sent! Check your browser notifications.`)
      } else {
        setResult(`❌ Failed: ${data.message || data.reason || 'Unknown error'}. Try the manual test below.`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testBrowserNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('🔔 Test Notification', {
            body: 'This is a test! Your browser supports notifications.',
            icon: '/icon-192x192.png'
          })
          setResult('✅ Browser notification sent! If you see it, notifications work!')
        } else {
          setResult('❌ Permission denied. Please allow notifications in your browser settings.')
        }
      })
    } else {
      setResult('❌ Your browser does not support notifications.')
    }
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔔 Test Push Notifications</h1>
      
      <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <h2 className="text-xl font-semibold mb-4">Quick Browser Test</h2>
        <p className="text-sm mb-4">First, test if your browser supports notifications:</p>
        <Button onClick={testBrowserNotification}>
          🧪 Test Browser Notification
        </Button>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status:</h2>
        <div className="space-y-2 text-sm">
          <p>Browser Support: {typeof window !== 'undefined' && 'Notification' in window ? '✅ Supported' : '❌ Not Supported'}</p>
          <p>Service Worker: {typeof window !== 'undefined' && 'serviceWorker' in navigator ? '✅ Supported' : '❌ Not Supported'}</p>
          <p>Push Manager: {typeof window !== 'undefined' && 'PushManager' in window ? '✅ Supported' : '❌ Not Supported'}</p>
          <p>Subscription: {hasSubscription ? '✅ Active' : '⚠️ Not Active (Push may not work)'}</p>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Test Browser Notification" above first</li>
          <li>Allow notifications when prompted</li>
          <li>If that works, try the push notification buttons below</li>
          <li>Try minimizing the browser to test background notifications</li>
        </ol>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button 
          onClick={() => testNotification('test')} 
          disabled={loading}
          className="h-20"
        >
          🔔 Test Notification
        </Button>
        
        <Button 
          onClick={() => testNotification('like')} 
          disabled={loading}
          className="h-20"
        >
          ❤️ Like Notification
        </Button>
        
        <Button 
          onClick={() => testNotification('comment')} 
          disabled={loading}
          className="h-20"
        >
          💬 Comment Notification
        </Button>
        
        <Button 
          onClick={() => testNotification('follow')} 
          disabled={loading}
          className="h-20"
        >
          👤 Follow Notification
        </Button>
        
        <Button 
          onClick={() => testNotification('mention')} 
          disabled={loading}
          className="h-20"
        >
          📢 Mention Notification
        </Button>
        
        <Button 
          onClick={() => testNotification('message')} 
          disabled={loading}
          className="h-20"
        >
          💬 Message Notification
        </Button>
        
        <Button 
          onClick={() => testNotification('xp')} 
          disabled={loading}
          className="h-20 md:col-span-2"
        >
          🏆 XP Overtake Notification
        </Button>
      </div>

      {result && (
        <Card className="p-4 bg-muted">
          <p className="text-sm whitespace-pre-wrap">{result}</p>
        </Card>
      )}

      <Card className="p-6 mt-6 bg-gray-50 dark:bg-gray-900/20">
        <h3 className="font-semibold mb-2">💡 Troubleshooting</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>If browser test works but push doesn't: Service worker issue (normal on localhost)</li>
          <li>If nothing works: Check browser notification permissions in settings</li>
          <li>Chrome: Settings → Privacy → Site Settings → Notifications</li>
          <li>The real notifications will work when someone actually likes/comments/follows you!</li>
        </ul>
      </Card>
    </div>
  )
}
