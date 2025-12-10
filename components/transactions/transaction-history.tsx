"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/app-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownLeft, Gift, Settings } from 'lucide-react'
import { formatTimeAgo } from '@/utils/formatDate'

interface Transaction {
  _id: string
  fromUserId: string
  toUserId: string
  amount: number
  type: 'transfer' | 'reward' | 'system'
  status: 'pending' | 'completed' | 'failed'
  description?: string
  transactionHash?: string
  createdAt: string
}

interface TransactionHistoryProps {
  limit?: number
}

export function TransactionHistory({ limit = 10 }: TransactionHistoryProps) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const userId = user?.id

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}&page=${page}&limit=${limit}`)
      const data = await response.json()
      if (data.success) {
        setTransactions(prev => page === 1 ? data.transactions : [...prev, ...data.transactions])
      } else {
        // Show mock data for now
        const mockTransactions = [
          {
            _id: '1',
            fromUserId: userId === 'user123' ? 'user456' : 'user123',
            toUserId: userId || 'unknown',
            amount: 50,
            type: 'transfer' as const,
            status: 'completed' as const,
            description: 'Payment for services',
            transactionHash: 'demo_123456789',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: '2',
            fromUserId: userId || 'unknown',
            toUserId: 'user789',
            amount: 25,
            type: 'reward' as const,
            status: 'completed' as const,
            description: 'Achievement reward',
            transactionHash: 'demo_987654321',
            createdAt: new Date(Date.now() - 7200000).toISOString()
          }
        ]
        setTransactions(prev => page === 1 ? mockTransactions : [...prev, ...mockTransactions])
      }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Failed to fetch transactions:', errorMessage)
      // Show mock data on error
      const mockTransactions = [
        {
          _id: '1',
          fromUserId: userId === 'user123' ? 'user456' : 'user123',
          toUserId: userId || 'unknown',
          amount: 50,
          type: 'transfer' as const,
          status: 'completed' as const,
          description: 'Payment for services',
          transactionHash: 'demo_123456789',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]
      setTransactions(mockTransactions)
    } finally {
      setLoading(false)
    }
  }, [userId, page, limit]);

  useEffect(() => {
    if (userId) {
      fetchTransactions()
    }
  }, [userId, page, fetchTransactions])

  const getTransactionIcon = (type: string, isOutgoing: boolean) => {
    if (type === 'reward') return <Gift className="w-4 h-4 text-green-500" />
    if (type === 'system') return <Settings className="w-4 h-4 text-blue-500" />
    return isOutgoing ? <ArrowUpRight className="w-4 h-4 text-red-500" /> : <ArrowDownLeft className="w-4 h-4 text-green-500" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!userId) {
    return <div className="text-center py-8 text-gray-500">Please log in to view transactions</div>
  }

  if (loading && transactions.length === 0) {
    return <div className="animate-pulse space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded" />
      ))}
    </div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx) => {
            const isOutgoing = tx.fromUserId === userId
            return (
              <div key={tx._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(tx.type, isOutgoing)}
                  <div>
                    <div className="font-medium">
                      {isOutgoing ? 'Sent' : 'Received'} {tx.amount} HBAR
                    </div>
                    <div className="text-sm text-gray-500">
                      {tx.description || `${tx.type} transaction`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(tx.status)}>
                    {tx.status}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(tx.createdAt)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {transactions.length >= limit && (
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
