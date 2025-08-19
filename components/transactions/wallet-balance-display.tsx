"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface WalletBalanceDisplayProps {
  showBalance?: boolean
}

export function WalletBalanceDisplay({ showBalance = true }: WalletBalanceDisplayProps) {
  const { user } = useAuth()
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(showBalance)
  const accountId = (user as any)?.hederaAccountId || 'demo-account'

  useEffect(() => {
    // Use the demoWalletBalance from user context instead of fetching from Hedera
    if (user?.demoWalletBalance !== undefined) {
      setBalance(user.demoWalletBalance.toString())
      setLoading(false)
    } else {
      setBalance('100') // Default balance
      setLoading(false)
    }
  }, [user?.demoWalletBalance])

  const fetchBalance = async () => {
    // Refresh user data to get latest balance
    window.location.reload()
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toFixed(4)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBalance}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {visible ? (
              loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded" />
              ) : (
                `${formatBalance(balance)} ℏ`
              )
            ) : (
              '••••••'
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            Demo Wallet Balance
          </div>
          
          {visible && !loading && (
            <div className="text-xs text-gray-400">
              Exact: {balance} HBAR
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}