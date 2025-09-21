"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload } from "lucide-react"

export default function CreateCommunityPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    longDescription: "",
    rules: ["", "", ""],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        router.push("/communities")
      } else {
        console.error('Failed to create community:', data.message)
      }
    } catch (error) {
      console.error('Error creating community:', error)
    }
  }

  const updateRule = (index: number, value: string) => {
    const newRules = [...formData.rules]
    newRules[index] = value
    setFormData({ ...formData, rules: newRules })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push("/communities")}
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>

          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Community</h1>
          <p className="text-muted-foreground">
            Build a space for like-minded developers to connect and share knowledge.
          </p>
        </div>

        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Community Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Community Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-card-foreground">
                  Community Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., React Developers"
                  className="bg-input border-border text-foreground"
                  required
                />
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-card-foreground">
                  Short Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief description of your community"
                  className="bg-input border-border text-foreground"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-card-foreground">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="fullstack">Full Stack</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="data">Data Science</SelectItem>
                    <SelectItem value="ai">AI/ML</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Long Description */}
              <div className="space-y-2">
                <Label htmlFor="longDescription" className="text-card-foreground">
                  Detailed Description
                </Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  placeholder="Provide a detailed description of what your community is about, what members can expect, and what makes it special..."
                  className="bg-input border-border text-foreground min-h-[120px]"
                  required
                />
              </div>

              {/* Community Avatar */}
              <div className="space-y-2">
                <Label className="text-card-foreground">Community Avatar</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    {formData.name ? formData.name[0].toUpperCase() : "?"}
                  </div>
                  <Button type="button" variant="outline" className="text-muted-foreground bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  For now, we'll use the first letter of your community name. Image upload coming soon!
                </p>
              </div>

              {/* Community Rules */}
              <div className="space-y-2">
                <Label className="text-card-foreground">Community Rules</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Set some ground rules to keep your community healthy and welcoming.
                </p>
                <div className="space-y-3">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-primary font-semibold mt-2">{index + 1}.</span>
                      <Input
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                        placeholder={`Rule ${index + 1}`}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push("/communities")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  Create Community
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}