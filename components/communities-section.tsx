"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CommunityCard } from "./community-card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface Community {
  id: string
  name: string
  description: string
  category: string
  memberCount: number
  postCount: number
  isJoined: boolean
  avatar: string
}

const communities: Community[] = [
  {
    id: "1",
    name: "React Developers",
    description: "A community for React developers to share knowledge and best practices",
    category: "Frontend",
    memberCount: 1250,
    postCount: 89,
    isJoined: false,
    avatar: "R",
  },
  {
    id: "2",
    name: "MongoDB Masters",
    description: "Everything about MongoDB, from basics to advanced optimization",
    category: "Backend",
    memberCount: 890,
    postCount: 156,
    isJoined: false,
    avatar: "M",
  },
  {
    id: "3",
    name: "Java Community",
    description: "Java developers unite! Share tips, tricks, and best practices",
    category: "Backend",
    memberCount: 2100,
    postCount: 234,
    isJoined: true,
    avatar: "J",
  },
  {
    id: "4",
    name: "Vue.js Enthusiasts",
    description: "Progressive framework for building user interfaces",
    category: "Frontend",
    memberCount: 756,
    postCount: 123,
    isJoined: false,
    avatar: "V",
  },
  {
    id: "5",
    name: "Python Developers",
    description: "From web development to data science, all things Python",
    category: "Backend",
    memberCount: 1890,
    postCount: 312,
    isJoined: false,
    avatar: "P",
  },
  {
    id: "6",
    name: "DevOps Engineers",
    description: "Bridging development and operations for better software delivery",
    category: "DevOps",
    memberCount: 1456,
    postCount: 198,
    isJoined: true,
    avatar: "D",
  },
]

export function CommunitiesSection() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [communityList, setCommunityList] = useState(communities)

  const handleJoinToggle = (communityId: string) => {
    setCommunityList((prev) =>
      prev.map((community) =>
        community.id === communityId ? { ...community, isJoined: !community.isJoined } : community,
      ),
    )
  }

  const filteredCommunities = communityList.filter(
    (community) =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          onClick={() => router.push("/create-community")}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          + Create Community
        </Button>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} onJoinToggle={handleJoinToggle} />
        ))}
      </div>

      {filteredCommunities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No communities found matching your search.</p>
        </div>
      )}
    </div>
  )
}