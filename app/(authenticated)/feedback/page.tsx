"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Bug, Lightbulb, Star, Clock, CheckCircle, AlertCircle, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/utils/formatDate"

interface FeedbackItem {
  _id: string
  type: string
  subject: string
  description: string
  rating?: number
  status: 'open' | 'in-progress' | 'solved'
  createdAt: string
}

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    type: "",
    subject: "",
    description: "",
    rating: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previousFeedback, setPreviousFeedback] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPreviousFeedback()
  }, [])

  const fetchPreviousFeedback = async () => {
    try {
      const response = await fetch('/api/feedback')
      if (response.ok) {
        const data = await response.json()
        setPreviousFeedback(data.feedback || [])
      }
    } catch (error) {
      console.error('Failed to fetch previous feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.subject || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Thank you for your feedback! We'll review it soon."
        })
        setFormData({ type: "", subject: "", description: "", rating: "" })
        fetchPreviousFeedback() // Refresh the list
      } else {
        throw new Error('Failed to submit feedback')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />
      case 'in-progress': return <AlertCircle className="w-4 h-4" />
      case 'solved': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'solved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4" />
      case 'feature': return <Lightbulb className="w-4 h-4" />
      case 'improvement': return <Star className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Feedback & Support</h1>
        <p className="text-gray-600 mt-2">
          Help us improve DevSocial by sharing your feedback, reporting bugs, or suggesting new features.
        </p>
      </div>

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Submit Feedback
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            My Feedback ({previousFeedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Submit New Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Feedback Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">
                        <div className="flex items-center gap-2">
                          <Bug className="w-4 h-4" />
                          Bug Report
                        </div>
                      </SelectItem>
                      <SelectItem value="feature">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Feature Request
                        </div>
                      </SelectItem>
                      <SelectItem value="general">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          General Feedback
                        </div>
                      </SelectItem>
                      <SelectItem value="improvement">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Improvement Suggestion
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your feedback"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">{formData.subject.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your feedback, including steps to reproduce if it's a bug"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[120px]"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500">{formData.description.length}/1000 characters</p>
                </div>

                {formData.type === "general" && (
                  <div className="space-y-2">
                    <Label htmlFor="rating">Overall Rating (Optional)</Label>
                    <Select value={formData.rating} onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rate your experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                        <SelectItem value="2">⭐⭐ Poor</SelectItem>
                        <SelectItem value="1">⭐ Very Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Previous Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading your feedback...</p>
                </div>
              ) : previousFeedback.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No feedback submitted yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Your submitted feedback will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {previousFeedback.map((feedback) => (
                    <div key={feedback._id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(feedback.type)}
                          <h3 className="font-medium">{feedback.subject}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(feedback.status)}>
                            {getStatusIcon(feedback.status)}
                            <span className="ml-1 capitalize">{feedback.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm">{feedback.description}</p>
                      
                      {feedback.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Rating:</span>
                          <span className="text-sm">
                            {'⭐'.repeat(feedback.rating)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{feedback.type} feedback</span>
                        <span>{formatDate(feedback.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}