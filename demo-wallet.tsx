'use client'

import { useState, useEffect } from 'react'
import { TransactionService } from '@/services/transactionService'

interface WalletProps {
  userId: string
}

export default function DemoWallet({ userId }: WalletProps) {
  const [balance, setBalance] = useState(0)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadBalance()
  }, [userId])

  const loadBalance = async () => {
    try {
      const balance = await TransactionService.getBalance(userId)
      setBalance(balance)
    } catch (error) {
      console.error('Failed to load balance:', error)
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !amount) return

    setLoading(true)
    setMessage('')

    try {
      const result = await TransactionService.transfer({
        fromUserId: userId,
        toUserId: recipient,
        amount: parseFloat(amount)
      })

      if (result.success) {
        setMessage('Transfer successful!')
        setBalance(result.balance || 0)
        setRecipient('')
        setAmount('')
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg max-w-md">
      <h2 className="text-xl font-bold mb-4">Demo Wallet</h2>
      
      <div className="mb-4">
        <span className="text-lg">Balance: </span>
        <span className="text-xl font-semibold">${balance.toFixed(2)}</span>
      </div>

      <form onSubmit={handleTransfer} className="space-y-3">
        <input
          type="text"
          placeholder="Recipient ID"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
          min="0.01"
          step="0.01"
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      {message && (
        <div className={`mt-3 p-2 rounded ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  )
}