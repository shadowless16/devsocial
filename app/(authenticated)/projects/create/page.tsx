"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Plus, X, ChevronDown, ChevronUp, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import { TECH_STACK, PROJECT_ROLES, PROJECT_TYPES, EXPERIENCE_LEVELS, TIME_COMMITMENTS } from "@/lib/projects/project-data"

type ProjectFormData = {
  title: string
  description: string
  projectType: string
  techStack: string[]
  experienceLevel: string
  timeCommitment: string
  openPositions: Array<{
    title: string
    description: string
    requirements: string[]
  }>
  githubUrl: string
  demoUrl: string
  websiteUrl: string
  images: string[]
}

export default function CreateProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    projectType: "",
    techStack: [],
    experienceLevel: "",
    timeCommitment: "",
    openPositions: [],
    githubUrl: "",
    demoUrl: "",
    websiteUrl: "",
    images: [],
  })
  
  // UI state for expandable sections
  const [showAllTech, setShowAllTech] = useState(false)
  const [showAllRoles, setShowAllRoles] = useState(false)
  const [techSearchTerm, setTechSearchTerm] = useState("")
  const [roleSearchTerm, setRoleSearchTerm] = useState("")

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const addTechStack = (tech: string) => {
    if (!formData.techStack.includes(tech)) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, tech],
      }))
    }
  }

  const removeTechStack = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tech),
    }))
  }

  const addPosition = () => {
    setFormData((prev) => ({
      ...prev,
      openPositions: [
        ...prev.openPositions,
        {
          title: "",
          description: "",
          requirements: [],
        },
      ],
    }))
  }

  const updatePosition = (index: number, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      openPositions: prev.openPositions.map((pos, i) => (i === index ? { ...pos, [field]: value } : pos)),
    }))
  }

  const removePosition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      openPositions: prev.openPositions.filter((_, i) => i !== index),
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      toast.loading('Creating project...', { id: 'create-project' })
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          technologies: formData.techStack,
          githubUrl: formData.githubUrl,
          liveUrl: formData.demoUrl,
          images: formData.images,
          openPositions: formData.openPositions,
          status: 'in-progress'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Project created successfully! (+50 XP)', { id: 'create-project' })
        router.push('/projects')
      } else {
        toast.error(data.details || data.error || 'Failed to create project', { id: 'create-project' })
      }
    } catch (error: unknown) {
      console.error('Error creating project:', error)
      toast.error('Network error. Please try again.', { id: 'create-project' })
    }
  }

  return (
    <main className="min-h-[100svh] bg-muted/30">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Create New Project</h1>
          <p className="text-sm text-muted-foreground">
            Share your project idea and find collaborators to bring it to life.
          </p>
        </header>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="[&>div]:bg-emerald-600" />
        </div>

        <Card className="border-0 ring-1 ring-black/5">
          <CardContent className="p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
                  <p className="text-muted-foreground">Tell us about your project</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter your project title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project, its goals, and what makes it unique..."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="mt-1 min-h-[120px]"
                      maxLength={4500}
                    />
                  </div>

                  <div>
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, projectType: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_TYPES.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Tech Stack */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold mb-2">Technology Stack</h2>
                  <p className="text-muted-foreground">What technologies will you use?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Selected Technologies</Label>
                    <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-lg min-h-[60px]">
                      {formData.techStack.map((tech) => (
                        <Badge key={tech} className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          {tech}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTechStack(tech)} />
                        </Badge>
                      ))}
                      {formData.techStack.length === 0 && (
                        <span className="text-muted-foreground text-sm">No technologies selected</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Available Technologies</Label>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Search technologies..."
                            value={techSearchTerm}
                            onChange={(e) => setTechSearchTerm(e.target.value)}
                            className="pl-8 w-48 h-8"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllTech(!showAllTech)}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          {showAllTech ? (
                            <><ChevronUp className="w-4 h-4 mr-1" />Show Less</>
                          ) : (
                            <><ChevronDown className="w-4 h-4 mr-1" />Show All ({TECH_STACK.length})</>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                      {TECH_STACK
                        .filter((tech) => 
                          !formData.techStack.includes(tech) &&
                          tech.toLowerCase().includes(techSearchTerm.toLowerCase())
                        )
                        .slice(0, showAllTech ? undefined : 20)
                        .map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="cursor-pointer hover:bg-emerald-50 transition-colors"
                            onClick={() => addTechStack(tech)}
                          >
                            {tech}
                          </Badge>
                        ))}
                    </div>
                    {!showAllTech && TECH_STACK.filter(tech => 
                      !formData.techStack.includes(tech) &&
                      tech.toLowerCase().includes(techSearchTerm.toLowerCase())
                    ).length > 20 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Showing 20 of {TECH_STACK.filter(tech => 
                          !formData.techStack.includes(tech) &&
                          tech.toLowerCase().includes(techSearchTerm.toLowerCase())
                        ).length} technologies
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experienceLevel">Experience Level *</Label>
                      <Select
                        value={formData.experienceLevel}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, experienceLevel: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE_LEVELS.map((level) => (
                            <SelectItem key={level} value={level.toLowerCase().replace(/\s+/g, '-')}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timeCommitment">Time Commitment *</Label>
                      <Select
                        value={formData.timeCommitment}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, timeCommitment: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select commitment" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_COMMITMENTS.map((commitment) => (
                            <SelectItem key={commitment} value={commitment.toLowerCase().replace(/\s+/g, '-')}>
                              {commitment}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Team & Roles */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold mb-2">Team & Open Positions</h2>
                  <p className="text-muted-foreground">What roles do you need help with?</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Open Positions</Label>
                    <Button onClick={addPosition} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Position
                    </Button>
                  </div>

                  {formData.openPositions.map((position, index) => (
                    <Card key={index} className="border-2 border-dashed">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Position {index + 1}</h4>
                          <Button
                            onClick={() => removePosition(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Position Title</Label>
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="Search roles..."
                                value={roleSearchTerm}
                                onChange={(e) => setRoleSearchTerm(e.target.value)}
                                className="pl-8 w-40 h-8"
                              />
                            </div>
                          </div>
                          <Select
                            value={position.title}
                            onValueChange={(value) => updatePosition(index, "title", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select or search position" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              <div className="p-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowAllRoles(!showAllRoles)}
                                  className="w-full justify-between text-emerald-600 hover:text-emerald-700"
                                >
                                  {showAllRoles ? 'Show Common Roles' : `Show All Roles (${PROJECT_ROLES.length})`}
                                  {showAllRoles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                              </div>
                              {PROJECT_ROLES
                                .filter(role => 
                                  role.toLowerCase().includes(roleSearchTerm.toLowerCase())
                                )
                                .slice(0, showAllRoles ? undefined : 15)
                                .map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Describe the role and responsibilities..."
                            value={position.description}
                            onChange={(e) => updatePosition(index, "description", e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>Required Skills</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.techStack.map((tech) => (
                              <Badge
                                key={tech}
                                variant={position.requirements.includes(tech) ? "default" : "outline"}
                                className={`cursor-pointer ${
                                  position.requirements.includes(tech)
                                    ? "bg-emerald-600 hover:bg-emerald-600/90"
                                    : "hover:bg-emerald-50"
                                }`}
                                onClick={() => {
                                  const newReqs = position.requirements.includes(tech)
                                    ? position.requirements.filter((r) => r !== tech)
                                    : [...position.requirements, tech]
                                  updatePosition(index, "requirements", newReqs)
                                }}
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {formData.openPositions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No positions added yet. Click &quot;Add Position&quot; to get started.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Media & Links */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold mb-2">Media & Links</h2>
                  <p className="text-muted-foreground">Add links and media to showcase your project</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="githubUrl">GitHub Repository</Label>
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/username/repo"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="demoUrl">Live Demo URL</Label>
                    <Input
                      id="demoUrl"
                      placeholder="https://your-demo.com"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, demoUrl: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="websiteUrl">Project Website</Label>
                    <Input
                      id="websiteUrl"
                      placeholder="https://your-project.com"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Project Images</Label>
                    <div className="mt-2">
                      <ImageUpload
                        maxFiles={5}
                        maxSizeMB={10}
                        folder="projects"
                        onUpload={(urls) => {
                          setFormData(prev => ({
                            ...prev,
                            images: urls
                          }))
                        }}
                        className="border-emerald-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold mb-2">Review & Publish</h2>
                  <p className="text-muted-foreground">Review your project details before publishing</p>
                </div>

                <div className="space-y-6">
                  <Card className="border-0 bg-muted/50">
                    <CardHeader>
                      <h3 className="font-semibold">Project Overview</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <strong>Title:</strong> {formData.title}
                      </div>
                      <div>
                        <strong>Type:</strong> {formData.projectType}
                      </div>
                      <div>
                        <strong>Description:</strong> {formData.description}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-muted/50">
                    <CardHeader>
                      <h3 className="font-semibold">Technology & Requirements</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <strong>Tech Stack:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.techStack.map((tech) => (
                            <Badge key={tech} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong>Experience Level:</strong> {formData.experienceLevel}
                      </div>
                      <div>
                        <strong>Time Commitment:</strong> {formData.timeCommitment}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-muted/50">
                    <CardHeader>
                      <h3 className="font-semibold">Open Positions ({formData.openPositions.length})</h3>
                    </CardHeader>
                    <CardContent>
                      {formData.openPositions.map((position, index) => (
                        <div key={index} className="mb-3 last:mb-0">
                          <div className="font-medium">{position.title}</div>
                          <div className="text-sm text-muted-foreground">{position.description}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-600/90"
                  disabled={
                    (currentStep === 1 && (!formData.title || !formData.description || !formData.projectType)) ||
                    (currentStep === 2 && (!formData.experienceLevel || !formData.timeCommitment))
                  }
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gap-2 bg-emerald-600 hover:bg-emerald-600/90">
                  <Check className="h-4 w-4" />
                  Publish Project
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}