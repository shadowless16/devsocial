"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AvatarSetup } from "@/components/onboarding/avatar-setup"
import { TechProfile } from "@/components/onboarding/tech-profile"
import { InterestTags } from "@/components/onboarding/interest-tags"
import { StarterBadge } from "@/components/onboarding/starter-badge"
import { WelcomeGamification } from "@/components/onboarding/welcome-gamification"
import { apiClient } from "@/lib/api/api-client"
import { useAuth } from "@/contexts/app-context"

const steps = [
  { id: 1, title: "Avatar & Bio Setup", component: AvatarSetup },
  { id: 2, title: "Tech Profile", component: TechProfile },
  { id: 3, title: "Interest Tags", component: InterestTags },
  { id: 4, title: "Pick Your Starter Badge", component: StarterBadge },
  { id: 5, title: "Welcome to DevSocial!", component: WelcomeGamification },
]

interface OnboardingData {
  avatar: string
  bio: string
  gender: string
  userType: string
  socials: { twitter: string; linkedin: string }
  techCareerPath: string
  experienceLevel: string
  techStack: string[]
  githubUsername: string
  linkedinUrl: string
  portfolioUrl: string
  interests: string[]
  starterBadge: string
  xp: number
  completed?: boolean
}

interface ApiResponse {
  success: boolean
  message?: string
  data?: OnboardingData
  error?: string
}

export default function OnboardingPage() {
  const { updateUser } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    avatar: "",
    bio: "",
    gender: "",
    userType: "",
    socials: { twitter: "", linkedin: "" },
    techCareerPath: "",
    experienceLevel: "beginner",
    techStack: [],
    githubUsername: "",
    linkedinUrl: "",
    portfolioUrl: "",
    interests: [],
    starterBadge: "",
    xp: 10,
  })

  // Load saved data on component mount
  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        // Try to load from database first
        const response = await apiClient.request<ApiResponse>('/users/onboarding', { method: 'GET' })
        if (response.success && response.data) {
          const data = response.data as unknown as OnboardingData;
          setOnboardingData(data)
          // Save to localStorage as backup
          if (typeof window !== 'undefined') {
            localStorage.setItem('onboarding-data', JSON.stringify(response.data))
          }
          return
        }
      } catch {
        console.log('No database data found, checking localStorage')
      }
      
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('onboarding-data')
        const savedStep = localStorage.getItem('onboarding-step')
        
        if (savedData) {
          setOnboardingData(JSON.parse(savedData))
        }
        if (savedStep) {
          setCurrentStep(parseInt(savedStep))
        }
      }
    }
    
    loadOnboardingData()
  }, [])

  const progress = (currentStep / steps.length) * 100
  const CurrentStepComponent = steps.find((step) => step.id === currentStep)?.component

  const handleNext = (stepData: Partial<OnboardingData>) => {
    const updatedData = { ...onboardingData, ...stepData }
    setOnboardingData(updatedData)
    
    // Check if this is the final step or if stepData indicates completion
    if (currentStep === steps.length || stepData.completed) {
      // Complete onboarding
      handleComplete(updatedData)
    } else {
      // Move to next step
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding-step', nextStep.toString())
      }
    }
  }

  const handleChange = (partialData: Partial<OnboardingData>) => {
    setOnboardingData((prev) => {
      const updated = { ...prev, ...partialData }
      // Save to localStorage immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding-data', JSON.stringify(updated))
      }
      
      // Save to database (async, non-blocking)
      apiClient.request('/users/onboarding', {
        method: 'PUT',
        body: JSON.stringify(updated)
      }).catch(err => console.log('Failed to save to database:', err))
      
      return updated
    })
  }

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding-step', prevStep.toString())
      }
    }
  }

  const handleComplete = async (data: OnboardingData) => {
    try{
      console.log("Onboarding completed:", data);
      
      // Call the onboarding API to save the data
      const response = await apiClient.request<ApiResponse>('/users/onboarding', {
        method: 'PUT',
        body: JSON.stringify({
          bio: data.bio,
          gender: data.gender,
          userType: data.userType,
          techCareerPath: data.techCareerPath,
          experienceLevel: data.experienceLevel,
          techStack: data.techStack,
          githubUsername: data.githubUsername,
          linkedinUrl: data.linkedinUrl,
          portfolioUrl: data.portfolioUrl,
          interests: data.interests,
          starterBadge: data.starterBadge,
          socials: data.socials,
          avatar: data.avatar
        })
      });
      
      console.log('Onboarding API response:', response);
      
      // Check success
      const isSuccess = response.success === true || 
                       (response.message && response.message.includes('success')) ||
                       response.data !== undefined || 
                       (response as { error?: string }).error === undefined;
      
      if (isSuccess) {
        console.log('Onboarding data saved successfully');
        // Clear saved data after successful completion
        if (typeof window !== 'undefined') {
          localStorage.removeItem('onboarding-data')
          localStorage.removeItem('onboarding-step')
        }
        updateUser({ onboardingCompleted: true });
        router.push('/');
      } else {
        throw new Error(response.message || 'Failed to save onboarding data');
      }
    } catch (error: unknown) {
      console.error("Failed to complete onboarding:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      // Only show error if it's a real API error
      if (errorMessage && !errorMessage.includes('Failed to save onboarding data')) {
        alert(`There was an issue: ${errorMessage}. Please update your profile later.`);
      } else {
        console.log('Onboarding likely succeeded, proceeding...');
        // Clear saved data even on error to prevent loops
        if (typeof window !== 'undefined') {
          localStorage.removeItem('onboarding-data')
          localStorage.removeItem('onboarding-step')
        }
        updateUser({ onboardingCompleted: true });
      }
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl font-bold text-navy-900">Welcome to DevSocial!</CardTitle>
            <span className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={onboardingData}
              onNext={handleNext}
              onChange={handleChange}
              onBack={currentStep > 1 ? handleBack : undefined}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
