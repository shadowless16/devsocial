"use client"

import { useEffect } from 'react'
import Link from 'next/link'

export default function DisablePrefetch() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      try {
        // next/link exposes prefetch on the default export in some Next versions.
        // Silence prefetching in development to avoid extra network noise.
        ;(Link as { prefetch?: () => void }).prefetch = () => {}
      } catch {
        // best-effort, don't crash client
      }
    }
  }, [])

  return null
}
