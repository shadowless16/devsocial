"use client"

import { useState, useEffect } from "react"
import { Search, Filter, User, Hash, FileText, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiClient } from "@/lib/api-client"
import { FeedItem } from "@/components/feed/FeedItem"
import { UserLink } from "@/components/shared/UserLink"
import { SearchSkeleton } from "@/components/skeletons/search-skeleton"
interface Post {
  id: string
  _id: string
  author: {
    username: string
    displayName: string
    avatar: string
    level: number
  } | null
  content: string
  imageUrl?: string | null
  tags: string[]
  likesCount: number
  commentsCount: number
  viewsCount: number
  xpAwarded: number
  createdAt: string
  isAnonymous: boolean
  isLiked: boolean
}

interface User {
  _id: string
  username: string
  displayName: string
  avatar: string
  level: number
  points: number
  bio: string
}

interface Tag {
  tag: string
  count: number
  posts: number
}

interface SearchResults {
  posts: Post[]
  users: User[]
  tags: Tag[]
}

interface SearchApiResponse {
  results: SearchResults
  query: string
  type: string
  pagination: {
    currentPage: number
    totalPages: number
    totalResults: number
    hasMore: boolean
  }
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [searchResults, setSearchResults] = useState<SearchResults>({
    posts: [],
    users: [],
    tags: [],
  })
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = async (query: string, type: string = "all") => {
    if (!query.trim()) {
      setSearchResults({ posts: [], users: [], tags: [] })
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setError(null)
    
    try {
      const response = await apiClient.request<SearchApiResponse>(
        `/search?q=${encodeURIComponent(query)}&type=${type}&limit=20`,
        { method: "GET" }
      )
      
      if (response.success && response.data) {
        setSearchResults(response.data.results)
        setHasSearched(true)
      } else {
        throw new Error(response.message || "Search failed")
      }
    } catch (error: any) {
      console.error("Search error:", error)
      setError(error.message || "An error occurred while searching")
      setSearchResults({ posts: [], users: [], tags: [] })
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, activeTab)
      } else {
        setSearchResults({ posts: [], users: [], tags: [] })
        setHasSearched(false)
      }
    }, 500) // Debounce search by 500ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery, activeTab])

  const handleLike = async (postId: string) => {
    if (!postId || postId === 'undefined') {
      console.error('Invalid post ID:', postId)
      return
    }
    
    try {
      const response = await apiClient.togglePostLike<{ liked: boolean; likesCount: number }>(postId)
      if (response.success && response.data) {
        const { liked, likesCount } = response.data // Destructure for cleaner code
        setSearchResults(prev => ({
          ...prev,
          posts: prev.posts.map(post =>
            (post.id || post._id) === postId
              ? {
                  ...post,
                  isLiked: liked,
                  likesCount: likesCount,
                }
              : post
          )
        }))
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults({ posts: [], users: [], tags: [] })
    setHasSearched(false)
    setError(null)
  }

  const totalResults = searchResults.posts.length + searchResults.users.length + searchResults.tags.length

  if (isSearching && !hasSearched) {
    return <SearchSkeleton />
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-3 rounded-full">
            <Search className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-2">Search</h1>
        <p className="text-gray-600">Find posts, users, and topics across the community</p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for posts, users, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Filters */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-xs bg-transparent">
                <Filter className="w-3 h-3 mr-1" />
                Filters
              </Button>
              <Badge variant="outline" className="text-xs">
                Recent
              </Badge>
            </div>

            {searchQuery && (
              <div className="text-sm text-gray-600">
                {isSearching ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                    Searching...
                  </div>
                ) : error ? (
                  <span className="text-red-500">Error: {error}</span>
                ) : hasSearched ? (
                  `${totalResults} results found`
                ) : null}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
            <TabsTrigger value="posts">Posts ({searchResults.posts.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({searchResults.users.length})</TabsTrigger>
            <TabsTrigger value="tags">Tags ({searchResults.tags.length})</TabsTrigger>
          </TabsList>

          {/* All Results */}
          <TabsContent value="all" className="space-y-6 mt-6">
            {/* Posts Section */}
            {searchResults.posts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Posts
                </h3>
                <div className="space-y-4">
                  {searchResults.posts.slice(0, 3).map((post) => (
                    <FeedItem 
                      key={post._id || post.id} 
                      post={{
                        ...post,
                        id: post._id || post.id,
                        createdAt: new Date(post.createdAt).toLocaleDateString()
                      }} 
                      onLike={handleLike} 
                    />
                  ))}
                  {searchResults.posts.length > 3 && (
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("posts")}
                      >
                        View all {searchResults.posts.length} posts
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Section */}
            {searchResults.users.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Users
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.users.slice(0, 4).map((user) => (
                    <UserLink key={user._id} username={user.username}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {(user.displayName || user.username || 'U')
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">{user.displayName}</h4>
                              <p className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">@{user.username}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Level {user.level}
                                </Badge>
                                <span className="text-xs text-gray-500">{user.points} points</span>
                              </div>
                              {user.bio && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{user.bio}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </UserLink>
                  ))}
                  {searchResults.users.length > 4 && (
                    <div className="col-span-full text-center">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("users")}
                      >
                        View all {searchResults.users.length} users
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags Section */}
            {searchResults.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  Tags
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.tags.slice(0, 6).map((tag) => (
                    <Card key={tag.tag} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                              {tag.tag}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-2">
                              {tag.posts} posts • {tag.count} total
                            </p>
                          </div>
                          <Hash className="w-6 h-6 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {searchResults.tags.length > 6 && (
                    <div className="col-span-full text-center">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("tags")}
                      >
                        View all {searchResults.tags.length} tags
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Results */}
            {totalResults === 0 && !isSearching && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or browse popular content.</p>
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6">
            {searchResults.posts.length > 0 ? (
              <div className="space-y-4">
                {searchResults.posts.map((post) => (
                  <FeedItem 
                    key={post._id || post.id} 
                    post={{
                      ...post,
                      id: post._id || post.id,
                      createdAt: new Date(post.createdAt).toLocaleDateString()
                    }} 
                    onLike={handleLike} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">No posts match your search criteria.</p>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            {searchResults.users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.users.map((user) => (
                  <UserLink key={user._id} username={user.username}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <Avatar className="w-16 h-16 mx-auto mb-4">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-lg">
                              {(user.displayName || user.username || 'U')
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">{user.displayName}</h4>
                          <p className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">@{user.username}</p>
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Level {user.level}
                            </Badge>
                            <span className="text-xs text-gray-500">{user.points} points</span>
                          </div>
                          {user.bio && (
                            <p className="text-sm text-gray-500 mt-3 line-clamp-3">{user.bio}</p>
                          )}
                          <Button variant="outline" size="sm" className="mt-4">
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </UserLink>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">No users match your search criteria.</p>
              </div>
            )}
          </TabsContent>

          {/* Tags Tab */}
          <TabsContent value="tags" className="mt-6">
            {searchResults.tags.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.tags.map((tag) => (
                  <Card key={tag.tag} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="bg-emerald-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                          <Hash className="w-6 h-6 text-emerald-600" />
                        </div>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 mb-3">
                          {tag.tag}
                        </Badge>
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-gray-900">{tag.posts}</p>
                          <p className="text-sm text-gray-600">posts</p>
                          <p className="text-xs text-gray-500">{tag.count} total occurrences</p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-4">
                          Explore Tag
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Hash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
                <p className="text-gray-600">No tags match your search criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Default state when no search has been performed */}
      {!hasSearched && !searchQuery && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start exploring</h3>
            <p className="text-gray-600 mb-6">Search for posts, users, or topics to discover amazing content from the community.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-emerald-50"
                onClick={() => setSearchQuery("javascript")}
              >
                #javascript
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-emerald-50"
                onClick={() => setSearchQuery("react")}
              >
                #react
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-emerald-50"
                onClick={() => setSearchQuery("python")}
              >
                #python
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-emerald-50"
                onClick={() => setSearchQuery("webdev")}
              >
                #webdev
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
