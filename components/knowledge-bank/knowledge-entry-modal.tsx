'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Technology {
  name: string
  icon: unknown
  color: string
}

interface KnowledgeEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onEntryCreated: (entry: unknown) => void
  technologies: Technology[]
}

const CATEGORIES = [
  'Tutorial',
  'Code Snippet',
  'Best Practice',
  'Troubleshooting',
  'Configuration',
  'API Reference',
  'Command Reference',
  'Quick Tip'
]

export function KnowledgeEntryModal({ isOpen, onClose, onEntryCreated, technologies }: KnowledgeEntryModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    technology: '',
    category: '',
    content: '',
    codeExample: '',
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.technology || !formData.category || !formData.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/knowledge-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        onEntryCreated(data.entry)
        setFormData({
          title: '',
          technology: '',
          category: '',
          content: '',
          codeExample: '',
          tags: []
        })
        toast({
          title: "Success",
          description: "Knowledge entry created successfully"
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create entry",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Knowledge Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., MongoDB Aggregation Pipeline Basics"
            />
          </div>

          {/* Technology and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="technology">Technology *</Label>
              <Select value={formData.technology} onValueChange={(value) => setFormData(prev => ({ ...prev, technology: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technology" />
                </SelectTrigger>
                <SelectContent>
                  {technologies.map((tech) => (
                    <SelectItem key={tech.name} value={tech.name}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Explain the concept, provide context, and describe the solution..."
              rows={4}
            />
          </div>

          {/* Code Example */}
          <div className="space-y-2">
            <Label htmlFor="codeExample">Code Example (Optional)</Label>
            <Textarea
              id="codeExample"
              value={formData.codeExample}
              onChange={(e) => setFormData(prev => ({ ...prev, codeExample: e.target.value }))}
              placeholder="Paste your code example here..."
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}