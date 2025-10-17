'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface AILog {
  _id: string
  service: 'mistral' | 'gemini'
  aiModel: string
  taskType: string
  inputLength: number
  outputSummary: string
  userId?: string
  success: boolean
  errorMessage?: string
  executionTime: number
  createdAt: string
}

interface Stats {
  _id: { service: string; taskType: string }
  count: number
  avgExecutionTime: number
  successRate: number
}

export default function AILogsPage() {
  const [logs, setLogs] = useState<AILog[]>([])
  const [stats, setStats] = useState<Stats[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [service, setService] = useState<string>('all')
  const [taskType, setTaskType] = useState<string>('all')

  useEffect(() => {
    fetchLogs()
  }, [page, service, taskType])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '50' })
      if (service !== 'all') params.append('service', service)
      if (taskType !== 'all') params.append('taskType', taskType)

      const res = await fetch(`/api/admin/ai-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setStats(data.stats)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Activity Logs</h1>
        <Button onClick={fetchLogs} variant="outline">Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={`${stat._id.service}-${stat._id.taskType}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {stat._id.service} - {stat._id.taskType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div>Calls: {stat.count}</div>
                <div>Avg Time: {stat.avgExecutionTime.toFixed(0)}ms</div>
                <div>Success: {(stat.successRate * 100).toFixed(1)}%</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Select value={service} onValueChange={setService}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="mistral">Mistral</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
              </SelectContent>
            </Select>

            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="moderation">Moderation</SelectItem>
                <SelectItem value="quality_analysis">Quality Analysis</SelectItem>
                <SelectItem value="summarization">Summarization</SelectItem>
                <SelectItem value="explanation">Explanation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log._id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.service === 'mistral' ? 'default' : 'secondary'}>
                        {log.service}
                      </Badge>
                      <Badge variant="outline">{log.taskType}</Badge>
                      <span className="text-sm text-muted-foreground">{log.aiModel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{log.executionTime}ms</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Input: {log.inputLength} chars</span>
                    {' • '}
                    <span>Output: {log.outputSummary}</span>
                  </div>
                  {log.errorMessage && (
                    <div className="text-sm text-red-600">Error: {log.errorMessage}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                    {log.userId && ` • User: ${log.userId}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} • Total: {total} logs
            </span>
            <Button
              onClick={() => setPage(p => p + 1)}
              disabled={logs.length < 50}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
