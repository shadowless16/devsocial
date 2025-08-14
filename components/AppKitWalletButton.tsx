"use client"

import { useEffect } from 'react'
import { useAppKitWallet } from '@/hooks/use-appkit-wallet'

export function AppKitWalletButton() {
  const { 
    isConnected, 
    accountId, 
    isConnecting, 
    connectWallet, 
    disconnectWallet,
    saveWalletConnection
  } = useAppKitWallet()

  useEffect(() => {
    if (isConnected && accountId) {
      saveWalletConnection()
    }
  }, [isConnected, accountId, saveWalletConnection])

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <div className="font-medium">Connected</div>
          <div className="text-gray-600">{accountId}</div>
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}