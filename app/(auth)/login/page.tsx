"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, Github, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleGitHubSignIn = async () => {
    setIsLoading(true)
    try {
      // Use consistent redirect handling for OAuth providers
      const result = await signIn("github", { 
        redirect: false
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      if (result?.ok) {
        // Check onboarding status and redirect accordingly
        setTimeout(async () => {
          try {
            const onboardingResponse = await fetch("/api/users/onboarding", {
              credentials: 'include'
            })
            
            if (onboardingResponse.ok) {
              const onboardingData = await onboardingResponse.json()
              
              if (onboardingData.user?.onboardingCompleted) {
                router.push("/feed")
              } else {
                router.push("/onboarding")
              }
            } else {
              router.push("/onboarding")
            }
          } catch (error) {
            console.error("Error checking onboarding:", error)
            router.push("/feed")
          }
        }, 1000)
      }
    } catch (error) {
      console.error("GitHub sign in error:", error)
      toast({
        title: "Sign in failed",
        description: "Failed to sign in with GitHub. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      console.log("Attempting Google sign in...")
      // Remove the hardcoded callbackUrl and let NextAuth handle the redirect
      const result = await signIn("google", { 
        redirect: false // Don't redirect immediately, handle it manually
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      if (result?.ok) {
        // Check onboarding status and redirect accordingly
        setTimeout(async () => {
          try {
            const onboardingResponse = await fetch("/api/users/onboarding", {
              credentials: 'include'
            })
            
            if (onboardingResponse.ok) {
              const onboardingData = await onboardingResponse.json()
              
              if (onboardingData.user?.onboardingCompleted) {
                router.push("/feed")
              } else {
                router.push("/onboarding")
              }
            } else {
              router.push("/onboarding")
            }
          } catch (error) {
            console.error("Error checking onboarding:", error)
            router.push("/feed")
          }
        }, 1000)
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      toast({
        title: "Sign in failed",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log("Attempting credentials login for:", formData.email)
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      console.log("Credentials login result:", result)

      if (result?.ok) {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        })
        
        // Wait a moment for session to be set
        setTimeout(async () => {
          try {
            const onboardingResponse = await fetch("/api/users/onboarding", {
              credentials: 'include'
            })
            console.log("Onboarding check response:", onboardingResponse.status)
            
            if (onboardingResponse.ok) {
              const onboardingData = await onboardingResponse.json()
              console.log("Onboarding data:", onboardingData)
              
              if (onboardingData.user?.onboardingCompleted) {
                router.push("/feed")
              } else {
                router.push("/onboarding")
              }
            } else {
              console.log("Onboarding check failed, redirecting to onboarding")
              router.push("/onboarding")
            }
          } catch (error) {
            console.error("Error checking onboarding:", error)
            router.push("/feed")
          }
        }, 1000)
        
      } else {
        console.log("Login failed:", result?.error)
        
        // Handle specific OAuth account error
        if (result?.error === "CredentialsSignin") {
          throw new Error("This account was created with Google. Please use 'Sign in with Google' instead.")
        }
        
        throw new Error(result?.error || "Invalid email or password")
      }

    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your Startup Nation account</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
            <CardDescription className="text-gray-600">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* OAuth Providers */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleGitHubSignIn}
                disabled={isLoading}
                className="bg-[#24292e] hover:bg-[#2f363d] text-white"
                size="lg"
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </Button>
              
              <Button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                size="lg"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or sign in with email</span>
              </div>
            </div>

            {/* Email/Password Sign In */}
            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <div>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  style={{ 
                    backgroundColor: '#ffffff !important',
                    color: '#111827 !important',
                    borderColor: '#d1d5db !important'
                  }}
                  required
                />
              </div>
              
              <div>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  style={{ 
                    backgroundColor: '#ffffff !important',
                    color: '#111827 !important',
                    borderColor: '#d1d5db !important'
                  }}
                  required
                />
              </div>
              
              <Button 
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                If you signed up with Google, please use the Google sign-in button above.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-silver mt-6">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-royal hover:text-royal/80">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-royal hover:text-royal/80">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
} 