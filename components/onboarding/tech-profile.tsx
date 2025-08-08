"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Briefcase, Github, Linkedin, Globe } from "lucide-react"

interface TechProfileProps {
  data: any
  onNext: (data: any) => void
  onBack?: () => void
}

const careerPaths = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Scientist",
  "ML Engineer",
  "Cloud Architect",
  "Security Engineer",
  "UI/UX Designer",
  "Other"
]

const techStackOptions = [
  // Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
  // Frontend
  "React", "Vue", "Angular", "Next.js", "Svelte", "HTML", "CSS", "Tailwind CSS", "SASS",
  // Backend
  "Node.js", "Express", "Django", "Flask", "Spring Boot", "ASP.NET", "Laravel", "Rails",
  // Databases
  "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Firebase",
  // Cloud & DevOps
  "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "CI/CD", "Git",
  // Mobile
  "React Native", "Flutter", "iOS", "Android",
  // Other
  "GraphQL", "REST API", "Microservices", "Machine Learning", "AI", "Blockchain"
]

export function TechProfile({ data, onNext, onBack }: TechProfileProps) {
  const [techData, setTechData] = useState({
    techCareerPath: data.techCareerPath || "",
    experienceLevel: data.experienceLevel || "beginner",
    techStack: data.techStack || [],
    githubUsername: data.githubUsername || "",
    linkedinUrl: data.linkedinUrl || "",
    portfolioUrl: data.portfolioUrl || ""
  })

  const [techStackInput, setTechStackInput] = useState("")

  const handleAddTech = (tech: string) => {
    if (!techData.techStack.includes(tech) && techData.techStack.length < 10) {
      setTechData({
        ...techData,
        techStack: [...techData.techStack, tech]
      })
    }
  }

  const handleRemoveTech = (tech: string) => {
    setTechData({
      ...techData,
      techStack: techData.techStack.filter((t: string) => t !== tech)
    })
  }

  const handleNext = () => {
    onNext(techData)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Tell us about your tech journey
          </CardTitle>
          <CardDescription>
            This helps us personalize your experience and connect you with relevant developers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="careerPath" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Career Path
              </Label>
              <Select
                value={techData.techCareerPath}
                onValueChange={(value) => setTechData({ ...techData, techCareerPath: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your path" />
                </SelectTrigger>
                <SelectContent>
                  {careerPaths.map((path) => (
                    <SelectItem key={path} value={path}>
                      {path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                value={techData.experienceLevel}
                onValueChange={(value) => setTechData({ ...techData, experienceLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                  <SelectItem value="expert">Expert (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tech Stack (Max 10)</Label>
            <Select onValueChange={handleAddTech}>
              <SelectTrigger>
                <SelectValue placeholder="Add technologies you work with" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {techStackOptions
                  .filter((tech) => !techData.techStack.includes(tech))
                  .map((tech) => (
                    <SelectItem key={tech} value={tech}>
                      {tech}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {techData.techStack.map((tech: string) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleRemoveTech(tech)}
                >
                  {tech} ×
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Social Profiles (Optional)</h3>
            
            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub Username
              </Label>
              <Input
                id="github"
                placeholder="johndoe"
                value={techData.githubUsername}
                onChange={(e) => setTechData({ ...techData, githubUsername: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/johndoe"
                value={techData.linkedinUrl}
                onChange={(e) => setTechData({ ...techData, linkedinUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Portfolio URL
              </Label>
              <Input
                id="portfolio"
                placeholder="https://johndoe.dev"
                value={techData.portfolioUrl}
                onChange={(e) => setTechData({ ...techData, portfolioUrl: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          className="ml-auto bg-emerald-600 hover:bg-emerald-700"
          disabled={!techData.techCareerPath}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
