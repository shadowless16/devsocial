'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, BookOpen, Code, Database, Globe } from 'lucide-react'
import { KnowledgeEntryModal } from '@/components/knowledge-bank/knowledge-entry-modal'
import { KnowledgeCard } from '@/components/knowledge-bank/knowledge-card'

interface KnowledgeEntry {
  _id: string
  title: string
  technology: string
  category: string
  content: string
  codeExample?: string
  tags: string[]
  author: {
    username: string
    profilePicture?: string
  }
  createdAt: string
  likes: number
  isLiked: boolean
}

const TECHNOLOGIES = [
  { name: 'All', icon: BookOpen, color: 'bg-gray-500' },
  { name: 'MongoDB', icon: Database, color: 'bg-green-500' },
  { name: 'JavaScript', icon: Code, color: 'bg-yellow-500' },
  { name: 'TypeScript', icon: Code, color: 'bg-blue-500' },
  { name: 'React', icon: Code, color: 'bg-cyan-500' },
  { name: 'Next.js', icon: Globe, color: 'bg-black' },
  { name: 'Node.js', icon: Code, color: 'bg-green-600' },
  { name: 'Python', icon: Code, color: 'bg-blue-600' },
  { name: 'Java', icon: Code, color: 'bg-red-500' },
  { name: 'HTML/CSS', icon: Globe, color: 'bg-orange-500' },
]

export default function KnowledgeBankPage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [selectedTech, setSelectedTech] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (selectedTech !== 'All') params.append('technology', selectedTech)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/knowledge-bank?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setEntries(data.entries)
      }
    } catch (error: unknown) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedTech, searchQuery])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleEntryCreated = (newEntry: KnowledgeEntry) => {
    setEntries(prev => [newEntry, ...prev])
    setShowModal(false)
  }

  const handleLike = async (entryId: string) => {
    try {
      const response = await fetch(`/api/knowledge-bank/${entryId}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setEntries(prev => prev.map(entry => 
          entry._id === entryId 
            ? { ...entry, isLiked: !entry.isLiked, likes: entry.isLiked ? entry.likes - 1 : entry.likes + 1 }
            : entry
        ))
      }
    } catch (error: unknown) {
      console.error('Error liking entry:', error)
    }
  }

  const filteredEntries = entries.filter(entry => 
    (selectedTech === 'All' || entry.technology === selectedTech) &&
    (searchQuery === '' || 
     entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Bank</h1>
          <p className="text-muted-foreground">Curated developer knowledge and code examples</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Knowledge
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search knowledge entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Technology Filter */}
      <div className="flex flex-wrap gap-2">
        {TECHNOLOGIES.map((tech) => {
          const Icon = tech.icon
          return (
            <Button
              key={tech.name}
              variant={selectedTech === tech.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTech(tech.name)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {tech.name}
            </Button>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{entries.length}</div>
            <div className="text-sm text-muted-foreground">Total Entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{new Set(entries.map(e => e.technology)).size}</div>
            <div className="text-sm text-muted-foreground">Technologies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{entries.reduce((sum, e) => sum + e.likes, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Likes</div>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Entries */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading knowledge entries...</div>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No entries found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedTech !== 'All' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Be the first to add knowledge to the bank!'
                }
              </p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <KnowledgeCard
              key={entry._id}
              entry={entry}
              onLike={() => handleLike(entry._id)}
            />
          ))
        )}
      </div>

      {/* Modal */}
      <KnowledgeEntryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onEntryCreated={handleEntryCreated}
        technologies={TECHNOLOGIES.slice(1)} // Exclude 'All'
      />
    </div>
  )
}