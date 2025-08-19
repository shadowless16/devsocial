"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Coins, Send } from "lucide-react"

interface TipModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
  recipientAvatar?: string
  currentUserId: string
  currentUserBalance: number
  onTipSent?: () => void
}

export function TipModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientAvatar,
  currentUserId,
  currentUserBalance,
  onTipSent
}: TipModalProps) {
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const quickAmounts = [1, 5, 10, 25, 50]

  const handleTip = async () => {
    const tipAmount = parseFloat(amount)
    
    if (!tipAmount || tipAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid tip amount",
        variant: "destructive"
      })
      return
    }

    if (tipAmount > currentUserBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough HBAR to send this tip",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/wallet/tip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          toUsername: recipientId,
          amount: tipAmount,
          description: message || `Tip for great content!`
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Tip sent!",
          description: `Successfully sent ${tipAmount} HBAR to ${recipientName}`
        })
        
        // Update the current user balance in the parent component
        if (data.balance !== undefined) {
          // Trigger a balance update - this should be handled by the parent
          window.dispatchEvent(new CustomEvent('balanceUpdate', { detail: { newBalance: data.balance } }))
        }
        
        onTipSent?.()
        onClose()
        setAmount("")
        setMessage("")
      } else {
        toast({
          title: "Failed to send tip",
          description: data.error || "Something went wrong",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send tip. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Send Tip
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={recipientAvatar?.includes('models.readyplayer.me') && recipientAvatar.endsWith('.glb') 
                  ? recipientAvatar.replace('.glb', '.png') 
                  : recipientAvatar || "/placeholder.svg"} 
                alt={recipientName}
              />
              <AvatarFallback>
                {recipientName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{recipientName}</p>
              <p className="text-sm text-muted-foreground">Receiving tip</p>
            </div>
          </div>

          {/* Your Balance */}
          <div className="text-sm text-muted-foreground">
            Your balance: <span className="font-medium text-foreground">{currentUserBalance} HBAR</span>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <Label className="text-sm font-medium">Quick amounts</Label>
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={quickAmount > currentUserBalance}
                  className="flex-1"
                >
                  {quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="amount">Amount (HBAR)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              max={currentUserBalance}
            />
          </div>

          {/* Optional Message */}
          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a nice message with your tip..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleTip} 
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Tip
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}