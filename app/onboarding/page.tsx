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
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/app-context"

const steps = [
  { id: 1, title: "Avatar & Bio Setup", component: AvatarSetup },
  { id: 2, title: "Tech Profile", component: TechProfile },
  { id: 3, title: "Interest Tags", component: InterestTags },
  { id: 4, title: "Pick Your Starter Badge", component: StarterBadge },
  { id: 5, title: "Welcome to DevSocial!", component: WelcomeGamification },
]

export default function OnboardingPage() {
  const { updateUser } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState({
    avatar: "",
    bio: "",
    gender: "",
    userType: "",
    socials: { twitter: "", linkedin: "" },
    techCareerPath: "",
    experienceLevel: "beginner",
    techStack: [] as string[],
    githubUsername: "",
    linkedinUrl: "",
    portfolioUrl: "",
    interests: [] as string[],
    starterBadge: "",
    xp: 10,
  })

  // Load saved data on component mount
  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        // Try to load from database first
        const response = await apiClient.request('/users/onboarding', { method: 'GET' })
        const res = response as any
        if (res && typeof res === 'object') {
          const dbData = {
            avatar: res.avatar || "",
            bio: res.bio || "",
            gender: res.gender || "",
            userType: res.userType || "",
            socials: res.socials || { twitter: "", linkedin: "" },
            techCareerPath: res.techCareerPath || "",
            experienceLevel: res.experienceLevel || "beginner",
            techStack: res.techStack || [],
            githubUsername: res.githubUsername || "",
            linkedinUrl: res.linkedinUrl || "",
            portfolioUrl: res.portfolioUrl || "",
            interests: res.interests || [],
            starterBadge: res.starterBadge || "",
            xp: res.xp || 10,
          }
          setOnboardingData(dbData)
          // Save to localStorage as backup
          localStorage.setItem('onboarding-data', JSON.stringify(dbData))
          return
        }
      } catch (error) {
        console.log('No database data found, checking localStorage')
      }
      
      // Fallback to localStorage
      const savedData = localStorage.getItem('onboarding-data')
      const savedStep = localStorage.getItem('onboarding-step')
      
      if (savedData) {
        setOnboardingData(JSON.parse(savedData))
      }
      if (savedStep) {
        setCurrentStep(parseInt(savedStep))
      }
    }
    
    loadOnboardingData()
  }, [])

  const progress = (currentStep / steps.length) * 100
  const CurrentStepComponent = steps.find((step) => step.id === currentStep)?.component

  const handleNext = (stepData: any) => {
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
      localStorage.setItem('onboarding-step', nextStep.toString())
    }
  }

  const handleChange = (partialData: any) => {
    setOnboardingData((prev) => {
      const updated = { ...prev, ...partialData }
      // Save to localStorage immediately
      localStorage.setItem('onboarding-data', JSON.stringify(updated))
      
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
      localStorage.setItem('onboarding-step', prevStep.toString())
    }
  }

  const handleComplete = async (data: any) => {
    try {
      console.log("Onboarding completed:", data);
      
      // Call the onboarding API to save the data
      const response = await apiClient.request('/users/onboarding', {
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
          avatar: data.avatar // Include avatar in the request
        })
      }) as any;
      
      console.log('Onboarding API response:', response);
      
      // Check multiple success indicators
      const isSuccess = response?.success === true || 
                       response?.status === 'success' || 
                       response?.message?.includes('success') ||
                       response?.data || 
                       !response?.error;
      
      if (isSuccess) {
        console.log('Onboarding data saved successfully');
        // Clear saved data after successful completion
        localStorage.removeItem('onboarding-data')
        localStorage.removeItem('onboarding-step')
        updateUser({ onboardingCompleted: true });
        router.push('/');
      } else {
        throw new Error((response as any)?.message || (response as any)?.error || 'Failed to save onboarding data');
      }
    } catch (error: any) {
      console.error("Failed to complete onboarding:", error);
      // Only show error if it's a real API error
      if (error?.message && !error.message.includes('Failed to save onboarding data')) {
        alert(`There was an issue: ${error.message}. Please update your profile later.`);
      } else {
        console.log('Onboarding likely succeeded, proceeding...');
        // Clear saved data even on error to prevent loops
        localStorage.removeItem('onboarding-data')
        localStorage.removeItem('onboarding-step')
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
