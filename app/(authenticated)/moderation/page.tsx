// @ts-nocheck
"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/app-context'
import { toast } from 'sonner'

export default function ModerationPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports?status=${filter}`)
      const data = await response.json()
      if (data.success) {
        setReports(data.data.reports)
      }
    } catch (error: unknown) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReports()
    }
  }, [user, fetchReports])

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-6xl overflow-hidden">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <Shield className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Moderation Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Review and manage reported content</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['pending', 'reviewed', 'resolved', 'dismissed'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className="capitalize text-xs md:text-sm"
            size="sm"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No {filter} reports</h3>
              <p className="text-gray-600">All clear! No reports to review in this category.</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <ReportCard key={report._id} report={report} onUpdate={fetchReports} />
          ))
        )}
      </div>
    </div>
  )
}

function ReportCard({ report, onUpdate }: { report: unknown; onUpdate: () => void }) {
  const [processing, setProcessing] = useState(false)

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'spam': return 'bg-orange-100 text-orange-800'
      case 'harassment': return 'bg-red-100 text-red-800'
      case 'inappropriate': return 'bg-purple-100 text-purple-800'
      case 'misinformation': return 'bg-yellow-100 text-yellow-800'
      case 'copyright': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'reviewed': return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'dismissed': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return null
    }
  }

  const handleAction = async (action: string) => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/reports/${report._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, status: action === 'dismiss' ? 'dismissed' : 'resolved' })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Report ${action === 'dismiss' ? 'dismissed' : 'resolved'} successfully`)
        onUpdate()
      } else {
        toast.error(data.error || 'Failed to update report')
      }
    } catch {
      toast.error('Failed to update report')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-3 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusIcon(report.status)}
            <Badge className={`${getReasonColor(report.reason)} text-xs`}>
              {report.reason.replace('_', ' ')}
            </Badge>
            <span className="text-xs md:text-sm text-gray-500">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Reporter Info */}
          <div>
            <h4 className="font-medium mb-2 text-sm md:text-base">Reported by</h4>
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-6 w-6 md:h-8 md:w-8">
                <AvatarImage src={report.reporter.avatar} />
                <AvatarFallback className="text-xs">
                  {report.reporter.displayName?.[0] || report.reporter.username[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs md:text-sm truncate">
                {report.reporter.displayName || report.reporter.username}
              </span>
            </div>
            {report.description && (
              <div>
                <h5 className="text-xs md:text-sm font-medium mb-1">Description</h5>
                <p className="text-xs md:text-sm text-gray-600 bg-gray-50 p-2 rounded line-clamp-3">
                  {report.description}
                </p>
              </div>
            )}
          </div>

          {/* Reported Content */}
          <div>
            <h4 className="font-medium mb-2 text-sm md:text-base">Reported Post</h4>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-5 w-5 md:h-6 md:w-6">
                  <AvatarImage src={report.reportedUser.avatar} />
                  <AvatarFallback className="text-xs">
                    {report.reportedUser.displayName?.[0] || report.reportedUser.username[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs md:text-sm font-medium truncate">
                  {report.reportedUser.displayName || report.reportedUser.username}
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-700 line-clamp-3">
                {report.reportedPost.content}
              </p>
            </div>
          </div>
        </div>

        {report.status === 'pending' && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('dismiss')}
              disabled={processing}
              className="text-gray-600 text-xs"
            >
              Dismiss
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('warning')}
              disabled={processing}
              className="text-yellow-600 text-xs"
            >
              Warning
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('post_removed')}
              disabled={processing}
              className="text-red-600 text-xs"
            >
              Remove Post
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}