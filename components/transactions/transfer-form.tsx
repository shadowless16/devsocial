"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UsernameInput } from './username-input'
import { Send, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/app-context'
import { useToast } from '@/hooks/use-toast'

export function TransferForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !username || !amount) return

    setLoading(true)
    try {
      const response = await fetch('/api/transactions/transfer-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUsername: username,
          amount: parseFloat(amount),
          description: description || 'Transfer'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Transfer Successful",
          description: `Sent ${amount} HBAR to @${username}`,
        })
        setUsername('')
        setAmount('')
        setDescription('')
      } else {
        toast({
          title: "Transfer Failed",
          description: data.message,
          variant: "destructive"
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to process transfer",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Send className="h-5 w-5 mr-2" />
          Send HBAR
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <Label htmlFor="username">Recipient Username</Label>
            <UsernameInput
              value={username}
              onChange={setUsername}
              placeholder="Start typing username..."
            />
          </div>
          
          <div>
            <Label htmlFor="amount">Amount (HBAR)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this for?"
              rows={2}
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Transfer
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}