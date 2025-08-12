"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/contexts/auth-context'

export default function AdminRolesPage() {
  const { user, loading: authLoading } = useAuth()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading) {
      fetchCurrentUser()
    }
  }, [authLoading, user])

  const fetchCurrentUser = async () => {
    try {
      console.log('Fetching current user...')
      
      // First try to get user from auth context
      if (user) {
        console.log('Using user from auth context:', { id: user.id, username: user.username, role: user.role })
        setCurrentUser({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        })
        setLoading(false)
        return
      }
      
      // Fallback to API call
      const response = await fetch('/api/admin/assign-role')
      console.log('Fetch response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('User data from API:', data)
        setCurrentUser(data.user)
      } else {
        const errorData = await response.json()
        console.error('Error fetching user:', errorData)
        setError(`Error fetching user: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setError(`Failed to fetch user: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const assignAnalyticsRole = async () => {
    if (!currentUser) {
      alert('No user found. Please refresh the page.')
      return
    }
    
    console.log('Assigning analytics role to user:', currentUser.id)
    
    try {
      const response = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser.id,
          role: 'analytics'
        })
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        setCurrentUser(data.user)
        alert('Analytics role assigned successfully! Please refresh the page.')
        window.location.reload()
      } else {
        alert(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error assigning role:', error)
      alert(`Failed to assign role: ${error.message}`)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Loading authentication...' : 'Loading user data...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Role Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current User Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentUser && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Username:</span>
                <span>{currentUser.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Current Role:</span>
                <Badge>{currentUser.role}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign Analytics Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={assignAnalyticsRole}
            disabled={currentUser?.role === 'analytics' || currentUser?.role === 'admin'}
            className="w-full"
          >
            {currentUser?.role === 'analytics' || currentUser?.role === 'admin' 
              ? 'Analytics Access Already Granted' 
              : 'Assign Analytics Role'
            }
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            onClick={() => window.open('/analytics', '_blank')}
            disabled={currentUser?.role !== 'analytics' && currentUser?.role !== 'admin'}
            className="w-full"
          >
            Open Analytics Dashboard
          </Button>
          <Button 
            onClick={() => {
              console.log('Current user:', currentUser)
              console.log('Browser console opened for debugging')
            }}
            variant="outline"
            className="w-full"
          >
            Debug Info (Check Console)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}