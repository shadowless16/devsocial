"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface TransactionResult {
  success: boolean
  transactionId?: string
  status?: string
  explorerUrl?: string
  error?: string
}

export function TestTransaction() {
  const [loading, setLoading] = useState(false)
  const [toAccountId, setToAccountId] = useState('0.0.4')
  const [amount, setAmount] = useState('1')
  const [result, setResult] = useState<TransactionResult | null>(null)
  const { toast } = useToast()

  const sendTestTransaction = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/hedera/test-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          toAccountId, 
          amount: parseFloat(amount) 
        })
      })
      
      const data = await response.json() as TransactionResult
      setResult(data)
      
      if (data.success) {
        toast({
          title: "Transaction Sent!",
          description: `Transaction ID: ${data.transactionId}`
        })
      } else {
        toast({
          title: "Transaction Failed",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Hedera Test Transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">To Account ID</label>
          <Input
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            placeholder="0.0.4"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Amount (HBAR)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1"
            step="0.1"
          />
        </div>
        
        <Button 
          onClick={sendTestTransaction} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send Test Transaction'}
        </Button>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            {result.success ? (
              <div className="space-y-2">
                <p><strong>Success!</strong></p>
                <p><strong>Transaction ID:</strong> {result.transactionId}</p>
                <p><strong>Status:</strong> {result.status}</p>
                <a 
                  href={result.explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Hedera Explorer
                </a>
              </div>
            ) : (
              <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}