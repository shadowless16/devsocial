"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Search, Shield, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  username: string
  displayName: string
  email: string
  role: string
  avatar?: string
  level: number
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAllUsers()
  }, [])

  const loadAllUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users/search?q=')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setUsers(data.data.users || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAllUsers()
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setUsers(data.data.users || [])
      } else {
        toast({
          title: "Search failed",
          description: data.message || "Failed to search users",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const response = await fetch('/api/admin/users/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, role: newRole } : u
        ))
        toast({
          title: "Success",
          description: `User role updated to ${newRole}`
        })
      } else {
        toast({
          title: "Failed",
          description: data.message || "Failed to update role",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      })
    } finally {
      setUpdating(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by username, display name, or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value === '') loadAllUsers()
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading users...</span>
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <UserAvatar 
                    user={{
                      username: user.username,
                      avatar: user.avatar,
                      displayName: user.displayName
                    }}
                    className="h-10 w-10"
                  />
                  <div>
                    <div className="font-medium">{user.displayName || user.username}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>
                  <Badge variant="outline">L{user.level}</Badge>
                  <Badge>{user.role}</Badge>
                </div>
                
                <div className="flex gap-2">
                  {user.role !== 'admin' && (
                    <Button
                      size="sm"
                      onClick={() => handleRoleChange(user._id, 'admin')}
                      disabled={updating === user._id}
                    >
                      {updating === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Make Admin'}
                    </Button>
                  )}
                  {user.role === 'admin' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRoleChange(user._id, 'user')}
                      disabled={updating === user._id}
                    >
                      {updating === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove Admin'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div className="text-sm text-muted-foreground text-center pt-2">
              Showing {users.length} user{users.length !== 1 ? 's' : ''}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        )}
      </CardContent>
    </Card>
  )
}
