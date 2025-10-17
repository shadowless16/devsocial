"use client"

import { useState, useEffect } from "react"
import { Search, X, Hash, User, FileText, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiClient } from "@/lib/api-client"
import { getAvatarUrl } from "@/lib/avatar-utils"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchResults {
  posts: any[]
  users: any[]
  tags: any[]
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults>({ posts: [], users: [], tags: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [smartMode, setSmartMode] = useState(false)
  const [searchSummary, setSearchSummary] = useState("")
  const [searchKeywords, setSearchKeywords] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) {
      setQuery("")
      setResults({ posts: [], users: [], tags: [] })
    }
  }, [isOpen])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query)
      } else {
        setResults({ posts: [], users: [], tags: [] })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true)
    setSearchSummary("")
    setSearchKeywords([])
    
    try {
      if (smartMode) {
        // AI-powered semantic search
        const response = await apiClient.request<any>(
          `/search/smart?q=${encodeURIComponent(searchQuery)}`,
          { method: "GET" }
        )
        
        if (response.success && response.data) {
          setResults({ 
            posts: response.data.results || [], 
            users: [], 
            tags: [] 
          })
          setSearchSummary(response.data.summary || "")
          setSearchKeywords(response.data.keywords || [])
        }
      } else {
        // Regular keyword search
        const response = await apiClient.request<any>(
          `/search?q=${encodeURIComponent(searchQuery)}&type=all&limit=5`,
          { method: "GET" }
        )
        
        if (response.success && response.data) {
          setResults(response.data.results)
        }
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (type: string, id: string) => {
    onClose()
    if (type === "user") {
      window.location.href = `/profile/${id}`
    } else if (type === "post") {
      window.location.href = `/post/${id}`
    } else if (type === "tag") {
      window.location.href = `/tag/${id}`
    }
  }

  const handleViewAll = () => {
    onClose()
    window.location.href = `/search?q=${encodeURIComponent(query)}`
  }

  const totalResults = results.posts.length + results.users.length + results.tags.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder={smartMode ? "Ask anything... (AI-powered)" : "Search posts, users, or tags..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base border-0 focus-visible:ring-0"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant={smartMode ? "default" : "outline"}
              size="sm"
              onClick={() => setSmartMode(!smartMode)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {smartMode ? "Smart Search ON" : "Smart Search"}
            </Button>
            {searchKeywords.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {searchKeywords.slice(0, 3).map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {searchSummary && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <Sparkles className="w-4 h-4 inline mr-1" />
                {searchSummary}
              </p>
            </div>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !query ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Start typing to search</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setQuery("javascript")}
                >
                  #javascript
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setQuery("react")}
                >
                  #react
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setQuery("python")}
                >
                  #python
                </Badge>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Users</h3>
                  </div>
                  <div className="space-y-2">
                    {results.users.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleResultClick("user", user.username)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={getAvatarUrl(user.avatar)} />
                          <AvatarFallback>
                            {(user.displayName || user.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">L{user.level}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {results.posts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Posts</h3>
                  </div>
                  <div className="space-y-2">
                    {results.posts.map((post) => (
                      <div
                        key={post._id || post.id}
                        onClick={() => handleResultClick("post", post._id || post.id)}
                        className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{post.author?.displayName || "Anonymous"}</span>
                          <span>•</span>
                          <span>{post.likesCount} likes</span>
                          <span>•</span>
                          <span>{post.commentsCount} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {results.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.tags.map((tag) => (
                      <Badge
                        key={tag.tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => handleResultClick("tag", tag.tag.replace(/^#+/, ""))}
                      >
                        #{tag.tag.replace(/^#+/, "")} ({tag.posts})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* View All Button */}
              {totalResults > 0 && (
                <div className="pt-2 border-t">
                  <button
                    onClick={handleViewAll}
                    className="w-full text-sm text-primary hover:text-primary/80 font-medium py-2"
                  >
                    View all {totalResults} results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
