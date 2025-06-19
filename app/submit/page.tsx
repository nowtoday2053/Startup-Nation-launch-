"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus,
  Sparkles,
  ExternalLink,
  Book,
  Target,
  Lightbulb
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

type PostType = "RESOURCE" | "STRATEGY" | "STORY"

export default function SubmitPage() {
  const { data: session, status } = useSession()
  const [selectedType, setSelectedType] = useState<PostType>("RESOURCE")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    url: "",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login"
    }
  }, [status])

  // Remove onboarding check to prevent redirect loops

  const postTypes = [
    {
      type: "RESOURCE" as PostType,
      icon: ExternalLink,
      title: "Resource",
      description: "Share tools, sites, templates, or any helpful resources",
      color: "bg-blue-500",
      examples: "Tools, SaaS platforms, templates, guides"
    },
    {
      type: "STRATEGY" as PostType,
      icon: Target,
      title: "Strategy",
      description: "Share marketing tactics, growth playbooks, or business strategies",
      color: "bg-green-500",
      examples: "Growth hacks, marketing campaigns, business tactics"
    },
    {
      type: "STORY" as PostType,
      icon: Book,
      title: "Story",
      description: "Share personal wins, failures, lessons learned, or experiences",
      color: "bg-purple-500",
      examples: "Success stories, failures, lessons learned"
    }
  ]

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5 && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "Description is required",
        variant: "destructive",
      })
      return
    }

    if (selectedType === "RESOURCE" && !formData.url.trim()) {
      toast({
        title: "Error", 
        description: "URL is required for resources",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content || undefined,
          url: formData.url || undefined,
          type: selectedType,
          tags: formData.tags,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit post")
      }

      toast({
        title: "Success!",
        description: "Your post has been submitted successfully",
      })

      router.push("/feed")
    } catch (error) {
      console.error("Error submitting post:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-70">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Startup Nation</span>
          </Link>
          
          <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
            <Link href="/submit" className="text-blue-500 font-semibold">
              Create
            </Link>
            <Link href="/explore" className="text-gray-600 hover:text-blue-500 transition-colors font-medium">
              Explore
            </Link>
            <Link href="/chat" className="text-gray-600 hover:text-blue-500 transition-colors font-medium">
              Chat
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Content</h1>
          <p className="text-gray-600">Share resources, strategies, or stories with the community</p>
        </div>

        {/* Post Type Selection */}
        <Card className="bg-white border border-gray-100 rounded-3xl shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Choose Content Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {postTypes.map((type) => {
                const Icon = type.icon
                return (
                  <div
                    key={type.type}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedType === type.type
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    onClick={() => setSelectedType(type.type)}
                  >
                    <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{type.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                    <p className="text-xs text-gray-500">{type.examples}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="bg-white border border-gray-100 rounded-3xl shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={selectedType === "RESOURCE" ? "Amazing tool for startups" : selectedType === "STRATEGY" ? "How I grew 10x with this strategy" : "My biggest startup failure"}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
              </div>

              {/* URL (for resources) */}
              {selectedType === "RESOURCE" && (
                <div>
                  <label htmlFor="url" className="block text-sm font-semibold text-gray-900 mb-2">
                    URL *
                  </label>
                  <input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={
                    selectedType === "RESOURCE" 
                      ? "Describe why this resource is helpful..."
                      : selectedType === "STRATEGY"
                      ? "Explain the strategy and how to implement it..."
                      : "Share your story, what happened, and what you learned..."
                  }
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-semibold text-gray-900 mb-2">
                  Tags (up to 5)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-0 rounded-lg px-3 py-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-400 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formData.tags.length >= 5}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || formData.tags.length >= 5 || formData.tags.includes(tagInput.trim())}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                  <Plus className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 