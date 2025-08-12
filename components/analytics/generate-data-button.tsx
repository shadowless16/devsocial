"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { Database, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function GenerateDataButton() {
  const { data: session } = useSession()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateData = async () => {
    if (!session?.user || session.user.role !== 'admin') {
      toast.error('Only admin users can generate sample data')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/analytics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      })

      if (!response.ok) {
        throw new Error('Failed to generate data')
      }

      const result = await response.json()
      toast.success('Analytics data generated for 30 days! Page will refresh to show updated metrics.')
      
      // Refresh the page to show new data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('Error generating data:', error)
      toast.error('Failed to generate sample data')
    } finally {
      setIsGenerating(false)
    }
  }

  // Only show for admin users
  if (!session?.user || session.user.role !== 'admin') {
    return null
  }

  return (
    <Button
      onClick={handleGenerateData}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className="bg-transparent"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Database className="h-4 w-4 mr-2" />
      )}
      {isGenerating ? 'Generating...' : 'Generate Sample Data'}
    </Button>
  )
}