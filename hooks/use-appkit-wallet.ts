"use client"

import { useAppKit, useAppKitAccount, useAppKitState } from '@reown/appkit/react'
import { useCallback } from 'react'

export function useAppKitWallet() {
  const { open, close } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { loading } = useAppKitState()

  const connectWallet = useCallback(async () => {
    open()
  }, [open])

  const disconnectWallet = useCallback(async () => {
    close()
    
    // Remove from database
    await fetch('/api/users/connect-wallet', {
      method: 'DELETE'
    })
  }, [close])

  const saveWalletConnection = useCallback(async () => {
    if (isConnected && address) {
      await fetch('/api/users/connect-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hederaAccountId: address
        })
      })
    }
  }, [isConnected, address])

  return {
    isConnected,
    accountId: address,
    isConnecting: loading,
    connectWallet,
    disconnectWallet,
    saveWalletConnection
  }
}