"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'

interface TransactionStatusTrackerProps {
  transactionId: string
  onStatusChange?: (status: string) => void
}

export function TransactionStatusTracker({ transactionId, onStatusChange }: TransactionStatusTrackerProps) {
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}/status`)
        const data = await response.json()
        setStatus(data.status)
        onStatusChange?.(data.status)
      } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Failed to check transaction status:', errorMessage)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
    
    // Poll for status updates every 5 seconds for pending transactions
    const interval = setInterval(() => {
      if (status === 'pending') {
        checkStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [transactionId, status, onStatusChange])

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'completed':
        return 'Transaction completed successfully'
      case 'failed':
        return 'Transaction failed'
      case 'pending':
        return 'Transaction is being processed...'
      default:
        return 'Checking transaction status...'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Transaction Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge className={getStatusColor()}>
              {status}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            {getStatusMessage()}
          </div>
          
          <div className="text-xs text-gray-500">
            Transaction ID: {transactionId}
          </div>
          
          {status === 'pending' && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              Checking for updates...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}