"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"

// Countries with flags (simplified list)
const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
]

const hearAboutUsOptions = [
  "Twitter/X",
  "LinkedIn", 
  "Google Search",
  "Friend Referral",
  "Reddit",
  "Product Hunt"
]

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    country: "",
    currentProject: "",
    hearAboutUs: ""
  })
  const [countrySearch, setCountrySearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  useEffect(() => {
    // Pre-fill name from session
    if (session?.user?.name && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || ""
      }))
    }
  }, [session, formData.name])

  useEffect(() => {
    // Check if user has already completed onboarding
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch("/api/users/onboarding")
        if (response.ok) {
          const data = await response.json()
          if (data.user?.onboardingCompleted) {
            router.push("/feed")
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error)
      }
    }

    if (session) {
      checkOnboardingStatus()
    }
  }, [session, router])

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters")
      return false
    }
    
    setIsCheckingUsername(true)
    setUsernameError("")
    
    try {
      const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`)
      const data = await response.json()
      
      if (data.available) {
        setUsernameError("")
        return true
      } else {
        setUsernameError("Username is already taken")
        return false
      }
    } catch (error) {
      setUsernameError("Error checking username availability")
      return false
    } finally {
      setIsCheckingUsername(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0
      case 2:
        return formData.username.trim().length >= 3 && !usernameError
      case 3:
        return formData.country.length > 0
      case 4:
        return formData.currentProject.trim().length > 0
      case 5:
        return formData.hearAboutUs.length > 0
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 5 && isStepValid()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!isStepValid()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Welcome to Startup Nation! 🎉",
          description: "Your profile has been set up successfully.",
        })
        router.push("/feed")
      } else {
        throw new Error("Failed to complete onboarding")
      }
    } catch (error) {
      console.error("Onboarding error:", error)
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border-0 rounded-3xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100">
          <div 
            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white font-bold">SN</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Startup Nation</h1>
            <p className="text-gray-600">Let's get to know you better</p>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">What's your name?</h2>
                  <p className="text-gray-600 text-sm">This will be displayed on your profile</p>
                </div>
                <div>
                  <Label htmlFor="onboarding-name" className="sr-only">Full Name</Label>
                  <Input
                    id="onboarding-name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-center text-lg py-6 border-2 focus:border-blue-500 rounded-xl"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose a username</h2>
                  <p className="text-gray-600 text-sm">This is how others will find you</p>
                </div>
                <div>
                  <Label htmlFor="onboarding-username" className="sr-only">Username</Label>
                  <Input
                    id="onboarding-username"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => {
                      const username = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
                      setFormData({ ...formData, username })
                      if (username.length >= 3) {
                        checkUsernameAvailability(username)
                      } else {
                        setUsernameError("")
                      }
                    }}
                    className="text-center text-lg py-6 border-2 focus:border-blue-500 rounded-xl"
                    autoFocus
                  />
                  {isCheckingUsername && (
                    <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Checking availability...
                    </div>
                  )}
                  {usernameError && (
                    <p className="text-center mt-2 text-sm text-red-600">{usernameError}</p>
                  )}
                  {formData.username.length >= 3 && !usernameError && !isCheckingUsername && (
                    <p className="text-center mt-2 text-sm text-green-600">✓ Username is available</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Where are you from?</h2>
                  <p className="text-gray-600 text-sm">Select your country</p>
                </div>
                <div>
                  <Input
                    id="onboarding-country-search"
                    name="countrySearch"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="text-center mb-4 border-2 focus:border-blue-500 rounded-xl"
                  />
                  <div className="max-h-64 overflow-y-auto border-2 border-gray-100 rounded-xl">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setFormData({ ...formData, country: country.name })
                          setCountrySearch("")
                        }}
                        className={`w-full p-3 text-left hover:bg-blue-50 transition-colors flex items-center space-x-3 ${
                          formData.country === country.name ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                        }`}
                      >
                        <span className="text-xl">{country.flag}</span>
                        <span className="font-medium">{country.name}</span>
                        {formData.country === country.name && (
                          <Check className="h-4 w-4 text-blue-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">What are you currently building?</h2>
                  <p className="text-gray-600 text-sm">Tell us about your current project or startup</p>
                </div>
                <div>
                  <Label htmlFor="onboarding-project" className="sr-only">Current Project</Label>
                  <textarea
                    id="onboarding-project"
                    name="currentProject"
                    placeholder="e.g., AI-powered fitness app, B2B SaaS platform, etc."
                    value={formData.currentProject}
                    onChange={(e) => setFormData({ ...formData, currentProject: e.target.value })}
                    className="w-full p-4 border-2 focus:border-blue-500 rounded-xl resize-none h-32 text-center"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">How did you hear about us?</h2>
                  <p className="text-gray-600 text-sm">Help us understand how founders discover our community</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {hearAboutUsOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setFormData({ ...formData, hearAboutUs: option })}
                      className={`p-3 text-sm border-2 rounded-xl transition-all ${
                        formData.hearAboutUs === option
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Finishing...</span>
                  </>
                ) : (
                  <>
                    <span>Complete</span>
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 