"use client"

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from '@reown/appkit/networks'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

const metadata = {
  name: 'DevSocial',
  description: 'Gamified dev-collab platform',
  url: 'https://techdevsocial.vercel.app',
  icons: ['https://techdevsocial.vercel.app/icon.png']
}

const networks = [mainnet, sepolia]

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true
  }
})

export { wagmiAdapter }