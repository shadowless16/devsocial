"use client"

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const AppKitProvider = dynamic(
  () => import('@/components/providers/appkit-provider').then(mod => ({ default: mod.AppKitProvider })),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center p-4">Loading wallet...</div>
  }
)

export function DynamicAppKitProvider({ children }: { children: ReactNode }) {
  return <AppKitProvider>{children}</AppKitProvider>
}