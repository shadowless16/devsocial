"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/utils/formatDate'

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
  updatedAt: string
}

interface TransactionDetailsModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export function TransactionDetailsModal({ transaction, isOpen, onClose }: TransactionDetailsModalProps) {
  const { toast } = useToast()

  if (!transaction) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status</span>
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Amount</span>
            <span className="font-mono">{transaction.amount} HBAR</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Type</span>
            <span className="capitalize">{transaction.type}</span>
          </div>

          <div>
            <span className="text-sm font-medium">From</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {transaction.fromUserId}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(transaction.fromUserId)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium">To</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {transaction.toUserId}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(transaction.toUserId)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {transaction.transactionHash && (
            <div>
              <span className="text-sm font-medium">Transaction Hash</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded truncate">
                  {transaction.transactionHash}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(transaction.transactionHash!)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`https://hashscan.io/testnet/transaction/${transaction.transactionHash}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {transaction.description && (
            <div>
              <span className="text-sm font-medium">Description</span>
              <p className="text-sm text-gray-600 mt-1">{transaction.description}</p>
            </div>
          )}

          <div className="flex justify-between text-xs text-gray-500">
            <span>Created: {formatDate(transaction.createdAt)}</span>
            <span>Updated: {formatDate(transaction.updatedAt)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}