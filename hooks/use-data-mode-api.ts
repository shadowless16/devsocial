"use client"

import { useDataMode } from '@/contexts/data-mode-context'
import { useCallback } from 'react'

export function useDataModeAPI() {
  const { dataMode } = useDataMode()

  const fetchWithDataMode = useCallback(async (url: string, options: RequestInit = {}) => {
    const separator = url.includes('?') ? '&' : '?'
    const urlWithDataMode = `${url}${separator}dataMode=${dataMode}`
    
    return fetch(urlWithDataMode, options)
  }, [dataMode])

  const get = useCallback((url: string, options: RequestInit = {}) => {
    return fetchWithDataMode(url, { ...options, method: 'GET' })
  }, [fetchWithDataMode])

  const post = useCallback((url: string, data?: any, options: RequestInit = {}) => {
    return fetchWithDataMode(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
  }, [fetchWithDataMode])

  return {
    dataMode,
    isDemo: dataMode === 'demo',
    isDatabase: dataMode === 'database',
    get,
    post,
    fetchWithDataMode,
  }
}