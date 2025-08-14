"use client"

import { useState, useEffect, useCallback } from 'react'
import { SignClient } from '@walletconnect/sign-client'
import { getSdkError } from '@walletconnect/utils'

interface WalletConnectState {
  isConnected: boolean
  accountId: string | null
  publicKey: string | null
  isConnecting: boolean
  error: string | null
  uri: string | null
  client: SignClient | null
}

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id'

export function useWalletConnect() {
  const [state, setState] = useState<WalletConnectState>({
    isConnected: false,
    accountId: null,
    publicKey: null,
    isConnecting: false,
    error: null,
    uri: null,
    client: null
  })

  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }, [])

  useEffect(() => {
    const initClient = async () => {
      try {
        const client = await SignClient.init({
          projectId: PROJECT_ID,
          metadata: {
            name: "DevSocial",
            description: "Gamified dev-collab platform on Hedera",
            url: "https://techdevsocial.vercel.app/",
            icons: ["https://techdevsocial.vercel.app/icon.png"]
          }
        })

        setState(prev => ({ ...prev, client }))

        // Check for existing sessions
        const sessions = client.session.getAll()
        if (sessions.length > 0) {
          const session = sessions[0]
          const accountId = session.namespaces.hedera?.accounts[0]?.split(':')[2]
          if (accountId) {
            setState(prev => ({
              ...prev,
              isConnected: true,
              accountId,
              publicKey: session.peer.metadata.publicKey || null
            }))
          }
        }

        // Listen for session events
        client.on('session_event', (event) => {
          console.log('Session event:', event)
        })

        client.on('session_update', ({ topic, params }) => {
          console.log('Session updated:', topic, params)
        })

        client.on('session_delete', () => {
          setState(prev => ({
            ...prev,
            isConnected: false,
            accountId: null,
            publicKey: null,
            uri: null
          }))
        })

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize WalletConnect client'
        }))
      }
    }

    initClient()
  }, [])

  const connectWallet = useCallback(async () => {
    if (!state.client) return

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const { uri, approval } = await state.client.connect({
        requiredNamespaces: {
          hedera: {
            methods: ['hedera_getNodeAddresses', 'hedera_executeTransaction'],
            chains: ['hedera:mainnet', 'hedera:testnet'],
            events: ['chainChanged', 'accountsChanged']
          }
        }
      })

      if (uri) {
        setState(prev => ({ ...prev, uri }))

        // Handle mobile deep linking
        if (isMobile()) {
          const deepLink = `hashpack://wc?uri=${encodeURIComponent(uri)}`
          window.location.href = deepLink
        }
      }

      const session = await approval()
      const accountId = session.namespaces.hedera?.accounts[0]?.split(':')[2]
      const publicKey = session.peer.metadata.publicKey

      if (accountId) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          accountId,
          publicKey: publicKey || null,
          isConnecting: false,
          uri: null
        }))

        // Save to database
        await fetch('/api/users/connect-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            hederaAccountId: accountId,
            publicKey: publicKey || null
          })
        })
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to connect wallet. Please try again.',
        uri: null
      }))
    }
  }, [state.client, isMobile])

  const disconnectWallet = useCallback(async () => {
    if (!state.client) return

    try {
      const sessions = state.client.session.getAll()
      if (sessions.length > 0) {
        await state.client.disconnect({
          topic: sessions[0].topic,
          reason: getSdkError('USER_DISCONNECTED')
        })
      }

      setState(prev => ({
        ...prev,
        isConnected: false,
        accountId: null,
        publicKey: null,
        uri: null
      }))

      // Remove from database
      await fetch('/api/users/connect-wallet', {
        method: 'DELETE'
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to disconnect wallet'
      }))
    }
  }, [state.client])

  return {
    isConnected: state.isConnected,
    accountId: state.accountId,
    publicKey: state.publicKey,
    isConnecting: state.isConnecting,
    error: state.error,
    uri: state.uri,
    isMobile: isMobile(),
    connectWallet,
    disconnectWallet
  }
}