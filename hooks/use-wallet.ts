import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface WalletData {
  balance: number
  currency: string
  recentTransactions?: unknown[]
}

interface TransactionResult {
  success: boolean
  transaction?: unknown
  balance?: number
  message: string
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWallet = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/wallet')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch wallet')
      }
      
      setWallet(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/wallet/balance')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch balance')
      }
      
      return data.balance
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      toast.error(errorMessage)
      return 0
    }
  }, [])

  const sendTip = useCallback(async (toUserId: string, amount: number, description?: string): Promise<TransactionResult> => {
    setLoading(true)
    try {
      const response = await fetch('/api/wallet/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId, amount, description })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Tip failed')
      }
      
      toast.success(`Tip sent successfully! ${amount} HBAR`)
      
      // Refresh wallet data
      await fetchWallet()
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [fetchWallet])

  const sendTransfer = useCallback(async (toUserId: string, amount: number, description?: string): Promise<TransactionResult> => {
    setLoading(true)
    try {
      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId, amount, description })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed')
      }
      
      toast.success(`Transfer completed! ${amount} HBAR sent`)
      
      // Refresh wallet data
      await fetchWallet()
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [fetchWallet])

  const getTransactionHistory = useCallback(async (page = 1, limit = 10) => {
    try {
      const response = await fetch(`/api/wallet/history?page=${page}&limit=${limit}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transaction history')
      }
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      toast.error(errorMessage)
      return { transactions: [], page: 1, total: 0, hasMore: false }
    }
  }, [])

  return {
    wallet,
    loading,
    error,
    fetchWallet,
    getBalance,
    sendTip,
    sendTransfer,
    getTransactionHistory
  }
}