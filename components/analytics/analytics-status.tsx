"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/app-context'

export function AnalyticsStatus() {
  const { user } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [statusData, setStatusData] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkAnalyticsStatus = useCallback(async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'analytics')) {
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch('/api/test-analytics')
      const data = await response.json()
      
      if (data.success) {
        setStatus('success')
        setStatusData(data.data)
      } else {
        setStatus('error')
        setStatusData(data)
      }
    } catch {
      setStatus('error')
      setStatusData({ error: 'Failed to check analytics status' })
    } finally {
      setIsChecking(false)
    }
  }, [user])

  useEffect(() => {
    checkAnalyticsStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Don't show for non-admin users
  if (!user || (user.role !== 'admin' && user.role !== 'analytics')) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Analytics System Status
              {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
              {status === 'loading' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
            </CardTitle>
            <CardDescription>
              Current status of analytics data collection and processing
            </CardDescription>
          </div>
          <Button
            onClick={checkAnalyticsStatus}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check Status
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {status === 'success' && (
            <>
              <Badge variant="default" className="bg-green-100 text-green-800">
                System Operational
              </Badge>
              {statusData && (
                <div className="text-sm text-muted-foreground">
                  Data available: {statusData.overview?.userAnalytics || 0} user records, 
                  {statusData.overview?.contentAnalytics || 0} content records
                </div>
              )}
            </>
          )}
          {status === 'error' && (
            <>
              <Badge variant="destructive">
                System Error
              </Badge>
              <div className="text-sm text-muted-foreground">
                {statusData?.details || statusData?.error || 'Unknown error occurred'}
              </div>
            </>
          )}
          {status === 'loading' && (
            <>
              <Badge variant="secondary">
                Checking...
              </Badge>
              <div className="text-sm text-muted-foreground">
                Verifying analytics system status
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}