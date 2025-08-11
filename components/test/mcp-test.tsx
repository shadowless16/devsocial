"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MCPTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'get_leaderboard',
          args: { limit: 5 }
        })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>MCP Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testLeaderboard} disabled={loading}>
          {loading ? 'Testing...' : 'Test Leaderboard MCP'}
        </Button>
        
        {result && (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}