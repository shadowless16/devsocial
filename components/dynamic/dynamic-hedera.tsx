"use client"

import dynamic from 'next/dynamic'

export const DynamicHederaWallet = dynamic(
  () => import('@/components/hedera/HederaWallet'),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
  }
)

// Disabled due to type compatibility issues with Next.js dynamic imports
// export const DynamicHashConnect = dynamic(
//   () => import('@hashgraph/hashconnect'),
//   { ssr: false }
// ) as any