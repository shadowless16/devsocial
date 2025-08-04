'use client'

import { useEffect } from 'react'
import { overrideConsole } from '@/utils/logger'

export function LoggerInitializer() {
  useEffect(() => {
    // Temporarily disabled to prevent infinite recursion
    // TODO: Fix logger implementation to handle console overrides safely
    // const restoreConsole = overrideConsole()
    
    // Optional: Restore original console on unmount
    // return () => {
    //   restoreConsole()
    // }
  }, [])
  
  return null
}
