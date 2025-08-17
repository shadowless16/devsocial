"use client"

import { useState, useEffect, useCallback } from 'react'
import { HashConnect } from '@hashgraph/hashconnect'

interface HashPackState {
  isConnected: boolean
  accountId: string | null
  isConnecting: boolean
  error: string | null
}

export function useHashPack() {
  const [state, setState] = useState<HashPackState>({
    isConnected: false,
    accountId: null,
    isConnecting: false,
    error: null
  })

  const [hashConnect, setHashConnect] = useState<HashConnect | null>(null)

  useEffect(() => {
    const initHashConnect = async () => {
      const hc = new HashConnect()
      
      const appMetadata = {
        name: "DevSocial",
        description: "Gamified dev-collab platform on Hedera",
        icon: "https://techdevsocial.vercel.app/icon.png",
        url: "https://techdevsocial.vercel.app/"
      }

      await hc.init(appMetadata, 'testnet')
      setHashConnect(hc)

      // Check for existing connection
      const savedData = hc.hcData
      if (savedData?.topic && savedData?.pairingData?.length > 0) {
        const pairingData = savedData.pairingData[0] as any
        const accountId = pairingData?.accountIds?.[0]
        if (accountId) {
          setState(prev => ({
            ...prev,
            isConnected: true,
            accountId
          }))
        }
      }
    }

    initHashConnect()
  }, [])

  const connectWallet = useCallback(async () => {
    if (!hashConnect) {
      setState(prev => ({ ...prev, error: 'HashConnect not initialized' }))
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const connectionData = await hashConnect.connectToLocalWallet() as any
      
      if (connectionData?.accountIds?.[0]) {
        const accountId = connectionData.accountIds[0]
        setState(prev => ({
          ...prev,
          isConnected: true,
          accountId,
          isConnecting: false
        }))

        // Save to user profile with error handling
        try {
          await fetch('/api/users/connect-wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hederaAccountId: accountId })
          })
        } catch (apiError) {
          console.warn('Failed to save wallet connection to profile:', apiError)
        }
      } else {
        throw new Error('No account ID received from wallet')
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error?.message || 'Failed to connect wallet. Please make sure HashPack is installed.'
      }))
    }
  }, [hashConnect])

  const disconnectWallet = useCallback(async () => {
    if (!hashConnect) return

    const savedData = hashConnect.hcData
    if (savedData?.topic) {
      hashConnect.disconnect(savedData.topic)
    }
    setState({
      isConnected: false,
      accountId: null,
      isConnecting: false,
      error: null
    })

    // Remove from user profile
    await fetch('/api/users/connect-wallet', {
      method: 'DELETE'
    })
  }, [hashConnect])

  return {
    ...state,
    connectWallet,
    disconnectWallet
  }
}