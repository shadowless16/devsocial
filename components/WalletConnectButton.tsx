"use client"

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useWalletConnect } from '@/hooks/use-walletconnect'

export function WalletConnectButton() {
  const { 
    isConnected, 
    accountId, 
    isConnecting, 
    error, 
    uri, 
    isMobile,
    connectWallet, 
    disconnectWallet 
  } = useWalletConnect()

  const [showQR, setShowQR] = useState(false)

  const handleConnect = async () => {
    await connectWallet()
    if (!isMobile) {
      setShowQR(true)
    }
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
    setShowQR(false)
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <div className="font-medium">Connected</div>
          <div className="text-gray-600">{accountId}</div>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect HashPack Wallet'}
      </button>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {uri && !isMobile && showQR && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Scan this QR code with your HashPack mobile app:
          </div>
          <div className="flex justify-center p-4 bg-white rounded border">
            <QRCodeSVG value={uri} size={200} />
          </div>
          <button
            onClick={() => setShowQR(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      {uri && isMobile && (
        <div className="text-sm text-gray-600">
          Opening HashPack app...
        </div>
      )}
    </div>
  )
}