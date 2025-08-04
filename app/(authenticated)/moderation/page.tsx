"use client"

import { useState } from "react"
import { Shield, AlertTriangle, CheckCircle, X, Eye, Flag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FeedItem } from "@/components/feed/FeedItem"

// Mock flagged content
const flaggedPosts = [
  {
    id: "1",
    author: {
      username: "troubleuser",
      displayName: "Trouble User",
      avatar: "/placeholder.svg?height=40&width=40",
      level: 3,
    },
    content: "This post contains inappropriate content that violates community guidelines...",
    imageUrl: null,
    tags: ["#inappropriate"],
    likesCount: 2,
    commentsCount: 1,
    xpAwarded: 10,
    createdAt: "1 hour ago",
    isAnonymous: false,
    isLiked: false,
    flaggedBy: "user123",
    flagReason: "Inappropriate content",
    flaggedAt: "30 minutes ago",
    status: "pending",
  },
  {
    id: "2",
    author: {
      username: "spammer",
      displayName: "Spam Account",
      avatar: "/placeholder.svg?height=40&width=40",
      level: 1,
    },
    content: "Buy my course! Get rich quick! Click this link now!!! 💰💰💰",
    imageUrl: null,
    tags: ["#spam"],
    likesCount: 0,
    commentsCount: 0,
    xpAwarded: 5,
    createdAt: "3 hours ago",
    isAnonymous: false,
    isLiked: false,
    flaggedBy: "moderator1",
    flagReason: "Spam/Self-promotion",
    flaggedAt: "2 hours ago",
    status: "pending",
  },
]

const flaggedComments = [
  {
    id: "c1",
    postId: "123",
    author: {
      username: "rudeuser",
      displayName: "Rude User",
      avatar: "/placeholder.svg?height=32&width=32",
      level: 5,
    },
    content: "This is a very rude and offensive comment that should be moderated...",
    likesCount: 0,
    createdAt: "2 hours ago",
    isLiked: false,
    flaggedBy: "user456",
    flagReason: "Harassment/Bullying",
    flaggedAt: "1 hour ago",
    status: "pending",
  },
]

const moderationLog = [
  {
    id: "1",
    action: "Post Approved",
    moderator: "admin",
    target: "Post by @alexchen",
    reason: "Content reviewed - no violations found",
    timestamp: "2 hours ago",
    type: "approve",
  },
  {
    id: "2",
    action: "Comment Deleted",
    moderator: "moderator1",
    target: "Comment by @baduser",
    reason: "Violated community guidelines - harassment",
    timestamp: "4 hours ago",
    type: "delete",
  },
  {
    id: "3",
    action: "User Warning",
    moderator: "admin",
    target: "@spamuser",
    reason: "Multiple spam reports",
    timestamp: "1 day ago",
    type: "warning",
  },
]

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState("posts")

  const handleApprove = (id: string, type: "post" | "comment") => {
    console.log(`Approved ${type} ${id}`)
    // Handle approval logic
  }

  const handleDelete = (id: string, type: "post" | "comment") => {
    console.log(`Deleted ${type} ${id}`)
    // Handle deletion logic
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "approve":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "delete":
        return <X className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-4 lg:py-6 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-red-400 to-pink-500 p-3 rounded-full">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-2">Moderation Dashboard</h1>
        <p className="text-gray-600">Review flagged content and maintain community standards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{flaggedPosts.length}</div>
            <div className="text-sm text-gray-600">Flagged Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{flaggedComments.length}</div>
            <div className="text-sm text-gray-600">Flagged Comments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Resolved Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">3</div>
            <div className="text-sm text-gray-600">Active Moderators</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Flagged Posts</TabsTrigger>
          <TabsTrigger value="comments">Flagged Comments</TabsTrigger>
          <TabsTrigger value="log">Moderation Log</TabsTrigger>
        </TabsList>

        {/* Flagged Posts */}
        <TabsContent value="posts" className="space-y-4 mt-6">
          {flaggedPosts.map((post) => (
            <Card key={post.id} className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flag className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Flagged Content</span>
                    <Badge variant="outline" className="text-red-600 border-red-300">
                      {post.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Flagged {post.flaggedAt} by @{post.flaggedBy}
                  </div>
                </div>
                <div className="text-sm text-red-600 font-medium">Reason: {post.flagReason}</div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <FeedItem post={post} onLike={() => {}} />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApprove(post.id, "post")}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50 bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(post.id, "post")}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Flagged Comments */}
        <TabsContent value="comments" className="space-y-4 mt-6">
          {flaggedComments.map((comment) => (
            <Card key={comment.id} className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flag className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700">Flagged Comment</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {comment.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Flagged {comment.flaggedAt} by @{comment.flaggedBy}
                  </div>
                </div>
                <div className="text-sm text-orange-600 font-medium">Reason: {comment.flagReason}</div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {comment.author.displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900">{comment.author.displayName}</h4>
                        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                          L{comment.author.level}
                        </Badge>
                        <span className="text-xs text-gray-500">@{comment.author.username}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{comment.createdAt}</span>
                      </div>
                      <p className="text-gray-900 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApprove(comment.id, "comment")}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50 bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Post
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(comment.id, "comment")}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Moderation Log */}
        <TabsContent value="log" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Moderation Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moderationLog.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">{getActionIcon(entry.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{entry.action}</span>
                        <span className="text-sm text-gray-500">by @{entry.moderator}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{entry.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Target: {entry.target}</p>
                      <p className="text-sm text-gray-500">{entry.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
