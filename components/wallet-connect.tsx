"use client"

import { useHashPack } from '@/hooks/use-hashpack'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function WalletConnect() {
  const { isConnected, accountId, isConnecting, error, connectWallet, disconnectWallet } = useHashPack()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          HashPack Wallet
        </CardTitle>
        <CardDescription>
          Connect your HashPack wallet to enable Hedera features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Wallet Connected</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Account ID</p>
              <p className="text-sm font-mono break-all">{accountId}</p>
            </div>
            <Button 
              onClick={disconnectWallet}
              variant="outline" 
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <Button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect HashPack
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}