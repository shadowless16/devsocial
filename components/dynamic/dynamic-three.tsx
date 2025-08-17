"use client"

import dynamic from 'next/dynamic'

export const DynamicCanvas = dynamic(
  () => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })),
  { ssr: false }
)

export const DynamicOrbitControls = dynamic(
  () => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })),
  { ssr: false }
)

// Disabled due to type compatibility issues
// export const DynamicModelViewer = dynamic(
//   () => import('@google/model-viewer'),
//   { ssr: false }
// ) as any