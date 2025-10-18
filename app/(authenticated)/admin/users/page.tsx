"use client"

import { useState, useEffect } from "react"
import { Users, Search, Filter, MoreVertical, Eye, Ban, Trash2, Shield, Mail, TrendingUp, Calendar, Award, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UsersManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })

  useEffect(() => {
    setPage(1)
  }, [filter])

  useEffect(() => {
    fetchUsers()
  }, [filter, page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await apiClient.request<{ users: any[], pagination: any }>(`/admin/users?filter=${filter}&page=${page}&limit=50`, { method: "GET" })
      if (response.success && response.data) {
        setUsers(response.data.users)
        setPagination(response.data.pagination)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    User Management
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and monitor all platform users</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {pagination.total}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Users</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search by username, name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-0 bg-slate-100 dark:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 border-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <Filter className="w-4 h-4 mr-2" />
                      {filter === "all" ? "All Users" : filter === "active" ? "Active" : filter === "blocked" ? "Blocked" : "Moderators"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem onClick={() => setFilter("all")}>All Users</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("active")}>Active Users</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("blocked")}>Blocked Users</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("moderators")}>Moderators</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredUsers.map((user) => (
                <Card 
                  key={user._id} 
                  className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/80 dark:bg-slate-900/80 backdrop-blur overflow-hidden"
                  onClick={() => router.push(`/profile/${user.username}`)}
                >
                  <CardContent className="p-0">
                    {/* Header with gradient */}
                    <div className="h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 relative">
                      <div className="absolute -bottom-12 left-6">
                        <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-900 shadow-xl ring-2 ring-blue-500/20">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                            {user.displayName?.[0] || user.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        {user.role === "admin" && (
                          <Badge className="bg-red-500/90 backdrop-blur text-white border-0 shadow-lg">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {user.role === "moderator" && (
                          <Badge className="bg-blue-500/90 backdrop-blur text-white border-0 shadow-lg">
                            <Shield className="w-3 h-3 mr-1" />
                            Mod
                          </Badge>
                        )}
                        {user.isBlocked && (
                          <Badge variant="destructive" className="backdrop-blur shadow-lg">
                            <Ban className="w-3 h-3 mr-1" />
                            Blocked
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="pt-16 px-6 pb-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                          {user.displayName}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">Level</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">{user.level}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Award className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">XP</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-600">{user.points}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">Posts</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600">{user.postsCount || 0}</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">Joined</span>
                          </div>
                          <div className="text-xs font-semibold text-orange-600">
                            {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-800 dark:hover:bg-blue-950"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/admin/users/${user._id}`)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="px-3">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => handleBlockUser(user._id)}>
                              <Ban className="w-4 h-4 mr-2" />
                              {user.isBlocked ? "Unblock" : "Block"}
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
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of <span className="font-bold text-slate-900 dark:text-white">{pagination.totalPages}</span>
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                      className="border-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
