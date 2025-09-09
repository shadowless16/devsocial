// "use client"

// import dynamic from 'next/dynamic'
// import { ReactNode } from 'react'

// const AppKitProvider = dynamic(
//   () => import('@/components/providers/appkit-provider').then(mod => ({ default: mod.AppKitProvider })),
//   { 
//     ssr: false,
//     loading: () => <div className="flex items-center justify-center p-4">Loading wallet...</div>
//   }
// )

// export function DynamicAppKitProvider({ children }: { children: ReactNode }) {
//   return <AppKitProvider>{children}</AppKitProvider>
// }

"use client"

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const AppKitProvider = dynamic(
  () => import('@/components/providers/appkit-provider').then(mod => ({ default: mod.AppKitProvider })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
)

export function DynamicAppKitProvider({ children }: { children: ReactNode }) {
  return <AppKitProvider>{children}</AppKitProvider>
}