"use client"

import { useState, useEffect } from "react"
import { Search, Filter, User, Hash, FileText, X, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  aiInsights?: {
    keywords?: string[]
  }
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
  const [initialLoad, setInitialLoad] = useState(true)
  const [smartSearch, setSmartSearch] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [trendingData, setTrendingData] = useState<any>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) {
      setSearchQuery(q)
    }
    
    // Fetch trending data
    apiClient.request('/search/trending', { method: 'GET' })
      .then(res => {
        if (res.success && res.data) {
          setTrendingData(res.data)
        }
      })
      .catch(err => console.error('Failed to fetch trending data:', err))
  }, [])

  const performSearch = async (query: string, type: string = "all") => {
    if (!query.trim()) {
      setSearchResults({ posts: [], users: [], tags: [] })
      setHasSearched(false)
      setInitialLoad(false)
      setAiSummary(null)
      setAiInsights(null)
      return
    }

    setIsSearching(true)
    setError(null)
    
    try {
      const endpoint = smartSearch ? '/search/smart' : '/search'
      const response = await apiClient.request<SearchApiResponse & { aiSummary?: string; aiInsights?: any }>(
        `${endpoint}?q=${encodeURIComponent(query)}&type=${type}&limit=20`,
        { method: "GET" }
      )
      
      if (response.success && response.data) {
        setSearchResults(response.data.results)
        setHasSearched(true)
        
        if (smartSearch && response.data.aiSummary) {
          setAiSummary(response.data.aiSummary)
          setAiInsights(response.data.results.aiInsights)
        } else {
          setAiSummary(null)
          setAiInsights(null)
        }
      } else {
        throw new Error(response.message || "Search failed")
      }
    } catch (error: any) {
      console.error("Search error:", error)
      setError(error.message || "An error occurred while searching")
      setSearchResults({ posts: [], users: [], tags: [] })
      setAiSummary(null)
      setAiInsights(null)
    } finally {
      setIsSearching(false)
      setInitialLoad(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, activeTab)
      } else {
        setSearchResults({ posts: [], users: [], tags: [] })
        setHasSearched(false)
        setInitialLoad(false)
        setAiSummary(null)
        setAiInsights(null)
      }
    }, 500) // Debounce search by 500ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery, activeTab, smartSearch])

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
    setInitialLoad(false)
    setAiSummary(null)
    setAiInsights(null)
  }

  const totalResults = searchResults.posts.length + searchResults.users.length + searchResults.tags.length

  if (isSearching && initialLoad) {
    return <SearchSkeleton />
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 md:px-6 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <div className="flex items-center justify-center mb-3 md:mb-4">
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-2 md:p-3 rounded-full shadow-lg">
            <Search className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
        </div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-navy-900 mb-1 md:mb-2">Search</h1>
        <p className="text-sm md:text-base text-gray-600 px-4">Find posts, users, and topics across the community</p>
      </div>

      {/* Search Bar */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-3 md:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <Input
              type="text"
              placeholder="Search for posts, users, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 md:pl-10 pr-9 md:pr-10 h-11 md:h-12 text-sm md:text-base"
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
          <div className="flex items-center justify-between mt-3 md:mt-4 gap-2">
            <div className="flex items-center space-x-1 md:space-x-2">
              <Button 
                variant={smartSearch ? "default" : "outline"} 
                size="sm" 
                className="text-xs h-8"
                onClick={() => setSmartSearch(!smartSearch)}
                title="AI-powered search (may be slower)"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">AI Search</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs bg-transparent h-8">
                <Filter className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <Badge variant="outline" className="text-xs">
                Recent
              </Badge>
            </div>

            {searchQuery && (
              <div className="text-xs md:text-sm text-gray-600 flex-shrink-0">
                {isSearching ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-emerald-600 mr-1 md:mr-2"></div>
                    <span className="hidden sm:inline">Searching...</span>
                  </div>
                ) : error ? (
                  <span className="text-red-500 truncate">Error</span>
                ) : hasSearched ? (
                  <span className="truncate">{totalResults} results</span>
                ) : null}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      {smartSearch && aiSummary && (
        <Card className="mb-4 md:mb-6 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-violet-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-lg shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  AI Summary
                  <Badge variant="outline" className="text-xs">Powered by Gemini</Badge>
                </h3>
                <p className="text-sm text-gray-700">{aiSummary}</p>
                {aiInsights && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-600">Keywords:</span>
                    {aiInsights.keywords?.map((kw: string) => (
                      <Badge key={kw} variant="secondary" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSearching && !initialLoad && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="text-gray-600">Searching{smartSearch ? ' with AI' : ''}...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {hasSearched && !isSearching && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="all" className="text-xs md:text-sm px-1 md:px-3 py-2">All ({totalResults})</TabsTrigger>
            <TabsTrigger value="posts" className="text-xs md:text-sm px-1 md:px-3 py-2">Posts ({searchResults.posts.length})</TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm px-1 md:px-3 py-2">Users ({searchResults.users.length})</TabsTrigger>
            <TabsTrigger value="tags" className="text-xs md:text-sm px-1 md:px-3 py-2">Tags ({searchResults.tags.length})</TabsTrigger>
          </TabsList>

          {/* All Results */}
          <TabsContent value="all" className="space-y-4 md:space-y-6 mt-4 md:mt-6 overflow-hidden">
            {/* Posts Section */}
            {searchResults.posts.length > 0 && (
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Posts
                </h3>
                <div className="space-y-3 md:space-y-4 overflow-hidden">
                  {searchResults.posts.slice(0, 3).map((post: any) => (
                    <div key={post._id || post.id} className="w-full overflow-hidden">
                      {smartSearch && post.relevanceScore && (
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {post.relevanceScore}% match
                          </Badge>
                          {post.aiReason && (
                            <span className="text-xs text-gray-500">{post.aiReason}</span>
                          )}
                        </div>
                      )}
                      <FeedItem 
                        post={{
                          ...post,
                          id: post._id || post.id,
                          createdAt: new Date(post.createdAt).toLocaleDateString()
                        }} 
                        onLike={handleLike} 
                      />
                    </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
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
          <TabsContent value="posts" className="mt-6 overflow-hidden">
            {searchResults.posts.length > 0 ? (
              <div className="space-y-4 overflow-hidden">
                {searchResults.posts.map((post: any) => (
                  <div key={post._id || post.id} className="w-full overflow-hidden">
                    {smartSearch && post.relevanceScore && (
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {post.relevanceScore}% match
                        </Badge>
                        {post.aiReason && (
                          <span className="text-xs text-gray-500">{post.aiReason}</span>
                        )}
                      </div>
                    )}
                    <FeedItem 
                      post={{
                        ...post,
                        id: post._id || post.id,
                        createdAt: new Date(post.createdAt).toLocaleDateString()
                      }} 
                      onLike={handleLike} 
                    />
                  </div>
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

      {/* Enhanced Default State */}
      {!hasSearched && !searchQuery && (
        <div className="space-y-6">
          {/* Trending Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-lg shadow-md">
                  <Search className="w-5 h-5 text-white" />
                </div>
                Trending Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(trendingData?.trending || ['Next.js', 'TypeScript', 'React', 'AI/ML', 'Web3', 'DevOps']).map((term: string, i: number) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <span className="text-2xl font-bold text-muted-foreground group-hover:text-primary">#{i + 1}</span>
                    <span className="font-medium text-sm">{term}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-lg shadow-md">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                Popular Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(trendingData?.topics || []).map((topic: any) => (
                  <Badge
                    key={topic.tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-2 text-sm"
                    onClick={() => setSearchQuery(topic.tag)}
                  >
                    #{topic.tag}
                    <span className="ml-2 text-xs opacity-70">{topic.count > 1000 ? `${(topic.count/1000).toFixed(1)}k` : topic.count}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-lg shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Explore by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: '💻', title: 'Frontend', desc: 'React, Vue, Angular', query: 'frontend' },
                  { icon: '⚙️', title: 'Backend', desc: 'Node.js, Python, Go', query: 'backend' },
                  { icon: '📱', title: 'Mobile', desc: 'React Native, Flutter', query: 'mobile' },
                  { icon: '🎨', title: 'Design', desc: 'UI/UX, Figma, CSS', query: 'design' },
                  { icon: '🤖', title: 'AI & ML', desc: 'Machine Learning, AI', query: 'AI' },
                  { icon: '🔐', title: 'Security', desc: 'Cybersecurity, Auth', query: 'security' },
                ].map((cat) => (
                  <button
                    key={cat.title}
                    onClick={() => setSearchQuery(cat.query)}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <span className="text-3xl">{cat.icon}</span>
                    <div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">{cat.title}</h4>
                      <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500 rounded-lg shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                Developers to Follow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(trendingData?.users || []).map((dev: any) => (
                  <div
                    key={dev.username}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                    onClick={() => setSearchQuery(dev.username)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={dev.avatar} />
                        <AvatarFallback>{(dev.displayName || dev.username).split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{dev.displayName}</span>
                          <Badge variant="outline" className="text-xs">L{dev.level}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">@{dev.username}</p>
                        {dev.bio && <p className="text-xs text-muted-foreground mt-1">{dev.bio}</p>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
