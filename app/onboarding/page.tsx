"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AvatarSetup } from "@/components/onboarding/avatar-setup"
import { TechProfile } from "@/components/onboarding/tech-profile"
import { InterestTags } from "@/components/onboarding/interest-tags"
import { StarterBadge } from "@/components/onboarding/starter-badge"
import { WelcomeGamification } from "@/components/onboarding/welcome-gamification"
import { apiClient } from "@/lib/api-client"

const steps = [
  { id: 1, title: "Avatar & Bio Setup", component: AvatarSetup },
  { id: 2, title: "Tech Profile", component: TechProfile },
  { id: 3, title: "Interest Tags", component: InterestTags },
  { id: 4, title: "Pick Your Starter Badge", component: StarterBadge },
  { id: 5, title: "Welcome to DevSocial!", component: WelcomeGamification },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState({
    avatar: "",
    bio: "",
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
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = async (data: any) => {
    try {
      console.log("Onboarding completed:", data);
      
      // Call the onboarding API to save the data
      const response = await apiClient.request('/users/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          bio: data.bio,
          techCareerPath: data.techCareerPath,
          experienceLevel: data.experienceLevel,
          techStack: data.techStack,
          githubUsername: data.githubUsername,
          linkedinUrl: data.linkedinUrl,
          portfolioUrl: data.portfolioUrl,
          interests: data.interests,
          starterBadge: data.starterBadge,
          socials: data.socials
        })
      });
      
      if (response.success) {
        console.log('Onboarding data saved successfully');
        window.location.href = '/';
      } else {
        throw new Error(response.message || 'Failed to save onboarding data');
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      // Show error message to user but still redirect for now
      alert('There was an issue saving your onboarding data. Please update your profile later.');
      window.location.href = '/';
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
              onBack={currentStep > 1 ? handleBack : undefined}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
