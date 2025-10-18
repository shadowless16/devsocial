"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { ArrowLeft, Activity, TrendingUp, Award, Calendar, Mail, MapPin, Link as LinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
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

  useEffect(() => {
    fetchUserDetails()
  }, [resolvedParams.userId])

  const fetchUserDetails = async () => {
    try {
      const response = await apiClient.request(`/admin/users/${resolvedParams.userId}`, { method: "GET" })
      if (response.success && response.data) {
        setUser(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (!user) return <div className="text-center py-12">User not found</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => router.back()} 
          className="mb-6 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-lg hover:shadow-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500"></div>
              <CardContent className="p-6 text-center -mt-16">
                <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white dark:border-slate-900 shadow-2xl ring-4 ring-blue-500/20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    {user.displayName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {user.displayName}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg">@{user.username}</p>
                <div className="flex justify-center gap-2 mb-6">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg px-3 py-1">
                    Level {user.level}
                  </Badge>
                  {user.role === "admin" && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg px-3 py-1">
                      Admin
                    </Badge>
                  )}
                  {user.role === "moderator" && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg px-3 py-1">
                      Moderator
                    </Badge>
                  )}
                </div>
                {user.bio && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    {user.bio}
                  </p>
                )}
                <div className="space-y-3 text-sm text-left bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  {user.email && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">{user.email}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <LinkIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <a href={user.website} target="_blank" className="text-blue-600 hover:underline">
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">
                      Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 backdrop-blur hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl w-fit mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 mb-1">{user.points}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total XP</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl w-fit mx-auto mb-3">
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-1">{user.stats?.postsCount || 0}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Posts</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 backdrop-blur hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl w-fit mx-auto mb-3">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-600 mb-1">{user.badges?.length || 0}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Badges</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 backdrop-blur hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl w-fit mx-auto mb-3">
                    <Activity className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-orange-600 mb-1">{user.stats?.commentsCount || 0}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Comments</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-lg p-1">
                <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">Activity</TabsTrigger>
                <TabsTrigger value="xp" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white">XP History</TabsTrigger>
                <TabsTrigger value="posts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Posts</TabsTrigger>
                <TabsTrigger value="actions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-4">
                    {user.recentActivity?.map((activity: any, i: number) => (
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
                    )) || <p className="text-gray-500">No recent activity</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="xp" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">XP Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-3">
                    {user.xpBreakdown?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.source}</p>
                          <p className="text-sm text-gray-600">{item.count} times</p>
                        </div>
                        <Badge variant="outline">{item.totalXP} XP</Badge>
                      </div>
                    )) || <p className="text-gray-500">No XP data available</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="posts" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Recent Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-3">
                    {user.recentPosts?.map((post: any) => (
                      <div key={post._id} className="p-3 border rounded-lg">
                        <p className="line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{post.likesCount} likes</span>
                          <span>{post.commentsCount} comments</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No posts yet</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="actions" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Admin Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="grid gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={async () => {
                        try {
                          await apiClient.request(`/admin/users/${resolvedParams.userId}/block`, { method: "POST" })
                          toast({ title: "Success", description: `User ${user?.isBlocked ? 'unblocked' : 'blocked'} successfully` })
                          fetchUserDetails()
                        } catch (error) {
                          toast({ title: "Error", description: "Failed to update user", variant: "destructive" })
                        }
                      }}
                    >
                      {user?.isBlocked ? "Unblock" : "Block"} User
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowXpDialog(true)}
                    >
                      Adjust XP
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowRoleDialog(true)}
                    >
                      Change Role
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      Reset Password
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Delete User
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
              } catch (error) {
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
              } catch (error) {
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
              } catch (error) {
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
              } catch (error) {
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
