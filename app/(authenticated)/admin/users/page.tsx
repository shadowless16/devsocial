"use client"

import { useState, useEffect } from "react"
import { Users, Search, Filter, MoreVertical, Eye, Ban, Trash2, Shield, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await apiClient.request<{ users: any[] }>(`/admin/users?filter=${filter}`, { method: "GET" })
      if (response.success && response.data) {
        setUsers(response.data.users)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (userId: string) => {
    try {
      await apiClient.request(`/admin/users/${userId}/block`, { method: "POST" })
      fetchUsers()
    } catch (error) {
      console.error("Failed to block user:", error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage and monitor all platform users</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {users.length} Total Users
        </Badge>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by username, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter: {filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter("all")}>All Users</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("blocked")}>Blocked</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("moderators")}>Moderators</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.displayName?.[0] || user.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{user.displayName}</h3>
                        {user.role === "admin" && <Badge variant="destructive">Admin</Badge>}
                        {user.role === "moderator" && <Badge>Moderator</Badge>}
                        {user.isBlocked && <Badge variant="outline" className="text-red-600">Blocked</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Level {user.level}</span>
                        <span>•</span>
                        <span>{user.points} XP</span>
                        <span>•</span>
                        <span>{user.postsCount || 0} posts</span>
                        <span>•</span>
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user._id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBlockUser(user._id)}>
                        <Ban className="w-4 h-4 mr-2" />
                        {user.isBlocked ? "Unblock" : "Block"} User
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={async () => {
                          if (confirm(`Delete ${user.username}?`)) {
                            await apiClient.request(`/admin/users/${user._id}/delete`, { method: "DELETE" })
                            fetchUsers()
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
