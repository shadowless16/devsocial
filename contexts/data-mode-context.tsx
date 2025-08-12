"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type DataMode = 'real' | 'generated'

interface DataModeContextType {
  dataMode: DataMode
  setDataMode: (mode: DataMode) => void
  isReal: boolean
  isGenerated: boolean
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined)

export function DataModeProvider({ children }: { children: ReactNode }) {
  const [dataMode, setDataMode] = useState<DataMode>('real')

  // Persist mode in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dataMode') as DataMode
    if (saved && ['real', 'generated'].includes(saved)) {
      setDataMode(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('dataMode', dataMode)
  }, [dataMode])

  const value = {
    dataMode,
    setDataMode,
    isReal: dataMode === 'real',
    isGenerated: dataMode === 'generated'
  }

  return (
    <DataModeContext.Provider value={value}>
      {children}
    </DataModeContext.Provider>
  )
}

export function useDataMode() {
  const context = useContext(DataModeContext)
  if (context === undefined) {
    throw new Error('useDataMode must be used within a DataModeProvider')
  }
  return context
}