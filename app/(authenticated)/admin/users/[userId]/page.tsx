"use client"

import { useState, useEffect, useCallback } from "react"
import { use } from "react"
import { ArrowLeft, Activity, TrendingUp, Award, Calendar, Mail, MapPin, Link as LinkIcon, Shield, Ban, Trash2, Key, Zap, MessageSquare, Heart, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/api/api-client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface UserDetail {
  _id: string
  username: string
  displayName: string
  email: string
  avatar?: string
  role: string
  level: number
  points: number
  badges?: Array<{ name: string }>
  stats?: {
    postsCount?: number
    commentsCount?: number
  }
  location?: string
  website?: string
  createdAt: string
  isBlocked?: boolean
  recentActivity?: Array<{
    type: string
    description: string
    timestamp: string
    xp?: number
  }>
  xpBreakdown?: Array<{
    source: string
    count: number
    totalXP: number
  }>
  recentPosts?: Array<{
    _id: string
    content: string
    likesCount: number
    commentsCount: number
    createdAt: string
  }>
}

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showXpDialog, setShowXpDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [xpAmount, setXpAmount] = useState("")
  const [xpAction, setXpAction] = useState("add")
  const [newRole, setNewRole] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const { toast } = useToast()

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await apiClient.request(`/admin/users/${resolvedParams.userId}`, { method: "GET" })
      if (response.success && response.data) {
        setUser(response.data as unknown as UserDetail)
      }
    } catch (error: unknown) {
      console.error("Failed to fetch user details:", error)
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.userId])

  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading user data...</p>
      </div>
    </div>
  )
  if (!user) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-400 text-xl">User not found</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    </div>
  )

  const xpProgress = ((user.points % 100) / 100) * 100
  const nextLevel = user.level + 1
  const xpNeeded = 100 - (user.points % 100)

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
              <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800">
                <Settings className="w-4 h-4 mr-2" />
                Quick Actions
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">

        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end gap-6">
                <Avatar className="w-32 h-32 border-4 border-slate-900 shadow-2xl">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    {user.displayName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">{user.displayName}</h1>
                    {user.role === "admin" && (
                      <Badge className="bg-red-500/90 text-white border-0">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {user.role === "moderator" && (
                      <Badge className="bg-blue-500/90 text-white border-0">
                        <Shield className="w-3 h-3 mr-1" />
                        Moderator
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-200 text-lg">@{user.username}</p>
                </div>
                <div className="flex gap-2 pb-2">
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - User Info */}
          <div className="col-span-12 lg:col-span-3">
            {/* Level Progress Card */}
            <Card className="bg-slate-900 border-slate-800 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-400">Current Level</p>
                    <p className="text-3xl font-bold text-white">{user.level}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress to Level {nextLevel}</span>
                    <span className="text-emerald-400 font-semibold">{xpProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={xpProgress} className="h-2 bg-slate-800" />
                  <p className="text-xs text-slate-500">{xpNeeded} XP needed</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-slate-900 border-slate-800 mb-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300">Posts</span>
                  </div>
                  <span className="text-white font-semibold">{user.stats?.postsCount || 0}</span>
                </div>
                <Separator className="bg-slate-800" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Award className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-slate-300">Badges</span>
                  </div>
                  <span className="text-white font-semibold">{user.badges?.length || 0}</span>
                </div>
                <Separator className="bg-slate-800" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 rounded-lg">
                      <Heart className="w-4 h-4 text-pink-400" />
                    </div>
                    <span className="text-slate-300">Comments</span>
                  </div>
                  <span className="text-white font-semibold">{user.stats?.commentsCount || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.email && (
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-sm truncate">{user.email}</span>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300 text-sm">{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <LinkIcon className="w-4 h-4 text-purple-400" />
                    <a href={user.website} target="_blank" className="text-blue-400 hover:underline text-sm truncate">
                      {user.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span className="text-slate-300 text-sm">
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-slate-900 border-slate-800 hover:border-emerald-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <Zap className="w-6 h-6 text-emerald-400" />
                    </div>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">+12%</Badge>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{user.points.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Total XP</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400">Active</Badge>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{user.stats?.postsCount || 0}</p>
                  <p className="text-sm text-slate-400">Total Posts</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                      <Award className="w-6 h-6 text-purple-400" />
                    </div>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">Rare</Badge>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{user.badges?.length || 0}</p>
                  <p className="text-sm text-slate-400">Badges Earned</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 hover:border-pink-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-pink-500/10 rounded-xl">
                      <Heart className="w-6 h-6 text-pink-400" />
                    </div>
                    <Badge variant="outline" className="border-pink-500/30 text-pink-400">High</Badge>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{user.stats?.commentsCount || 0}</p>
                  <p className="text-sm text-slate-400">Engagement</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-900 border border-slate-800 p-1">
                <TabsTrigger value="activity" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Activity</TabsTrigger>
                <TabsTrigger value="xp" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">XP History</TabsTrigger>
                <TabsTrigger value="posts" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">Posts</TabsTrigger>
                <TabsTrigger value="actions" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-4">
                    {user.recentActivity && user.recentActivity.length > 0 ? user.recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{activity.type}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {activity.xp && <Badge>+{activity.xp} XP</Badge>}
                      </div>
                    )) : <p className="text-gray-500">No recent activity</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="xp" className="mt-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">XP Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-3">
                    {user.xpBreakdown && user.xpBreakdown.length > 0 ? user.xpBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.source}</p>
                          <p className="text-sm text-gray-600">{item.count} times</p>
                        </div>
                        <Badge variant="outline">{item.totalXP} XP</Badge>
                      </div>
                    )) : <p className="text-gray-500">No XP data available</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="posts" className="mt-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Recent Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-3">
                    {user.recentPosts && user.recentPosts.length > 0 ? user.recentPosts.map((post) => (
                      <div key={post._id} className="p-3 border rounded-lg">
                        <p className="line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{post.likesCount} likes</span>
                          <span>{post.commentsCount} comments</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )) : <p className="text-gray-500">No posts yet</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="actions" className="mt-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Admin Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="border-slate-700 hover:bg-slate-800 text-white justify-start h-auto py-4"
                      onClick={async () => {
                        try {
                          await apiClient.request(`/admin/users/${resolvedParams.userId}/block`, { method: "POST" })
                          toast({ title: "Success", description: `User ${user?.isBlocked ? 'unblocked' : 'blocked'} successfully` })
                          fetchUserDetails()
                        } catch {
                          toast({ title: "Error", description: "Failed to update user", variant: "destructive" })
                        }
                      }}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <Ban className="w-5 h-5 mb-1" />
                        <span className="font-semibold">{user?.isBlocked ? "Unblock" : "Block"} User</span>
                        <span className="text-xs text-slate-400">Restrict access</span>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-slate-700 hover:bg-slate-800 text-white justify-start h-auto py-4"
                      onClick={() => setShowXpDialog(true)}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <Zap className="w-5 h-5 mb-1" />
                        <span className="font-semibold">Adjust XP</span>
                        <span className="text-xs text-slate-400">Modify points</span>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-slate-700 hover:bg-slate-800 text-white justify-start h-auto py-4"
                      onClick={() => setShowRoleDialog(true)}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <Shield className="w-5 h-5 mb-1" />
                        <span className="font-semibold">Change Role</span>
                        <span className="text-xs text-slate-400">Update permissions</span>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-slate-700 hover:bg-slate-800 text-white justify-start h-auto py-4"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <Key className="w-5 h-5 mb-1" />
                        <span className="font-semibold">Reset Password</span>
                        <span className="text-xs text-slate-400">Security action</span>
                      </div>
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="col-span-2 justify-start h-auto py-4"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <Trash2 className="w-5 h-5 mb-1" />
                        <span className="font-semibold">Delete User</span>
                        <span className="text-xs opacity-80">Permanent action</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
          </div>
        </div>

        <Dialog open={showXpDialog} onOpenChange={setShowXpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust XP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select value={xpAction} onValueChange={setXpAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add XP</SelectItem>
                  <SelectItem value="remove">Remove XP</SelectItem>
                  <SelectItem value="set">Set XP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={xpAmount} onChange={(e) => setXpAmount(e.target.value)} placeholder="Enter amount" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowXpDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                await apiClient.request(`/admin/users/${resolvedParams.userId}/xp`, {
                  method: "PATCH",
                  body: JSON.stringify({ action: xpAction, amount: parseInt(xpAmount) })
                })
                toast({ title: "Success", description: "XP updated successfully" })
                setShowXpDialog(false)
                fetchUserDetails()
              } catch {
                toast({ title: "Error", description: "Failed to update XP", variant: "destructive" })
              }
            }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          <div>
            <Label>New Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                await apiClient.request(`/admin/users/${resolvedParams.userId}/role`, {
                  method: "PATCH",
                  body: JSON.stringify({ role: newRole })
                })
                toast({ title: "Success", description: "Role updated successfully" })
                setShowRoleDialog(false)
                fetchUserDetails()
              } catch {
                toast({ title: "Error", description: "Failed to update role", variant: "destructive" })
              }
            }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
          </DialogHeader>
          <div>
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                await apiClient.request(`/admin/users/${resolvedParams.userId}/reset-password`, {
                  method: "POST",
                  body: JSON.stringify({ newPassword })
                })
                toast({ title: "Success", description: "Password reset successfully" })
                setShowPasswordDialog(false)
                setNewPassword("")
              } catch {
                toast({ title: "Error", description: "Failed to reset password", variant: "destructive" })
              }
            }}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to permanently delete this user? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              try {
                await apiClient.request(`/admin/users/${resolvedParams.userId}/delete`, { method: "DELETE" })
                toast({ title: "Success", description: "User deleted successfully" })
                router.push("/admin/users")
              } catch {
                toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
              }
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
