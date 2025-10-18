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
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-3xl">{user.displayName?.[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mb-1">{user.displayName}</h2>
              <p className="text-gray-600 mb-4">@{user.username}</p>
              <div className="flex justify-center gap-2 mb-4">
                <Badge>Level {user.level}</Badge>
                {user.role === "admin" && <Badge variant="destructive">Admin</Badge>}
                {user.role === "moderator" && <Badge>Moderator</Badge>}
              </div>
              {user.bio && <p className="text-sm text-gray-600 mb-4">{user.bio}</p>}
              <div className="space-y-2 text-sm text-left">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                    <a href={user.website} target="_blank" className="text-blue-600 hover:underline">
                      {user.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <p className="text-2xl font-bold">{user.points}</p>
                <p className="text-sm text-gray-600">Total XP</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{user.stats?.postsCount || 0}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{user.badges?.length || 0}</p>
                <p className="text-sm text-gray-600">Badges</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">{user.stats?.commentsCount || 0}</p>
                <p className="text-sm text-gray-600">Comments</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="xp">XP History</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
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

            <TabsContent value="xp" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>XP Breakdown</CardTitle>
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

            <TabsContent value="posts" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
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

            <TabsContent value="actions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
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
  )
}
