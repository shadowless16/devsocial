"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { X, Flag } from 'lucide-react'
import { toast } from 'sonner'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
}

const reportReasons = [
  { value: 'spam', label: 'Spam or repetitive content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'misinformation', label: 'False or misleading information' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'other', label: 'Other' }
]

export function ReportModal({ isOpen, onClose, postId }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason) {
      toast.error('Please select a reason for reporting')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          reason,
          description: description.trim() || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Report submitted successfully')
        onClose()
        setReason('')
        setDescription('')
      } else {
        toast.error(data.error || 'Failed to submit report')
      }
    } catch (error) {
      toast.error('Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Report Post</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Why are you reporting this post?
              </Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                {reportReasons.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                Additional details (optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more context about why you're reporting this post..."
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={submitting || !reason}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}