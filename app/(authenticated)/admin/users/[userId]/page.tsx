"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { ArrowLeft, Activity, TrendingUp, Award, Calendar, Mail, MapPin, Link as LinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showXpDialog, setShowXpDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)

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
                        await apiClient.request(`/admin/users/${resolvedParams.userId}/block`, { method: "POST" })
                        fetchUserDetails()
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
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={async () => {
                        if (confirm("Delete this user permanently?")) {
                          await apiClient.request(`/admin/users/${resolvedParams.userId}/delete`, { method: "DELETE" })
                          router.push("/admin/users")
                        }
                      }}
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
    </div>
  )
}
