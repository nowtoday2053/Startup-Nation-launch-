"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  TrendingUp, 
  Sparkles,
  Star,
  Users,
  ExternalLink,
  MessageCircle,
  Filter,
  Search,
  Flame,
  Crown,
  ChevronRight,
  User,
  LogOut,
  Plus,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { formatTimeAgo, formatNumber } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TrendingPost {
  id: string
  title: string
  content?: string
  url?: string
  type: "RESOURCE" | "STRATEGY" | "STORY"
  tags: string[]
  slug: string
  voteCount: number
  commentCount: number
  createdAt: string
  author: {
    id: string
    name: string
    username?: string
    image?: string
  }
}

interface FeaturedCreator {
  id: string
  name: string
  username?: string
  image?: string
  bio?: string
  _count: {
    posts: number
    followers: number
  }
}

export default function ExplorePage() {
  const { data: session, status } = useSession()
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([])
  const [featuredCreators, setFeaturedCreators] = useState<FeaturedCreator[]>([])
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [timeframe, setTimeframe] = useState("week")
  const [isLoading, setIsLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login"
    }
  }, [status])

  // Remove onboarding check to prevent redirect loops

  useEffect(() => {
    fetchTrendingContent()
  }, [timeframe])

  const fetchTrendingContent = async () => {
    setIsLoading(true)
    try {
      // This would normally fetch from API endpoints
      // For now, using mock data that represents what the API would return
      
      const mockTrendingPosts: TrendingPost[] = [
        {
          id: "1",
          title: "The Ultimate SaaS Growth Playbook",
          content: "Complete guide to scaling your SaaS from 0 to $1M ARR with proven strategies and tactics.",
          type: "RESOURCE",
          tags: ["growth", "saas", "strategy"],
          slug: "saas-growth-playbook",
          voteCount: 247,
          commentCount: 32,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: "1",
            name: "Sarah Wilson",
            username: "sarahw",
            image: ""
          }
        },
        {
          id: "2", 
          title: "How I Failed 3 Startups Before My Big Success",
          content: "The brutal truth about my entrepreneurial journey and the lessons that finally led to a $50M exit.",
          type: "STORY",
          tags: ["failure", "lessons", "success"],
          slug: "failed-startups-success",
          voteCount: 189,
          commentCount: 45,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: "2",
            name: "Mike Chen",
            username: "mikechen",
            image: ""
          }
        }
      ]

      const mockCreators: FeaturedCreator[] = [
        {
          id: "1",
          name: "Sarah Wilson",
          username: "sarahw",
          image: "",
          bio: "Growth marketer helping SaaS companies scale",
          _count: { posts: 23, followers: 1247 }
        },
        {
          id: "2", 
          name: "Mike Chen",
          username: "mikechen",
          image: "",
          bio: "Serial entrepreneur and startup advisor",
          _count: { posts: 18, followers: 892 }
        }
      ]

      setTrendingPosts(mockTrendingPosts)
      setFeaturedCreators(mockCreators)
      setPopularTags(["growth", "saas", "marketing", "product", "startup", "funding", "ai", "design"])
    } catch (error) {
      console.error("Error fetching trending content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "RESOURCE":
        return <ExternalLink className="h-4 w-4" />
      case "STRATEGY":
        return <TrendingUp className="h-4 w-4" />
      case "STORY":
        return <MessageCircle className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "RESOURCE":
        return "bg-blue-50 text-blue-600"
      case "STRATEGY":
        return "bg-green-50 text-green-600"
      case "STORY":
        return "bg-purple-50 text-purple-600"
      default:
        return "bg-gray-50 text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              Startup Nation
            </Link>
            
            <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
              <Link href="/submit" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                Create
              </Link>
              <Link href="/explore" className="text-blue-600 font-semibold">
                Explore
              </Link>
              <Link href="/chat" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                Chat
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-sm">
                        {session.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href={`/profile/${session.user?.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        Profile
                      </Link>

                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          signOut()
                          setShowDropdown(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button asChild variant="ghost" className="text-gray-700 hover:text-gray-900">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-black hover:bg-gray-800 text-white rounded-lg">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-serif">Explore</h1>
          <p className="text-xl text-gray-600 leading-relaxed">Discover trending content, popular creators, and hot topics in the startup community</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-6 mb-12 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-gray-900 text-lg">Trending</span>
            </div>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {["day", "week", "month"].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    timeframe === period
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  This {period}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Posts */}
          <div className="space-y-8">
            {isLoading ? (
              <div className="space-y-8">
                {[...Array(5)].map((_, i) => (
                  <article key={i} className="border-b border-gray-200 py-8">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              trendingPosts.map((post, index) => (
                <article key={post.id} className="border-b border-gray-200 pb-8 hover:bg-gray-50/50 transition-all duration-200 group">
                  <div className="flex items-start justify-between gap-8">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Author info and metadata */}
                      <div className="flex items-center mb-3 space-x-2">
                        <Link href={`/profile/${post.author.id}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author.image || ""} />
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                              {post.author.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-700">
                            {post.author.name || "Anonymous"}
                          </span>
                        </Link>
                        <span className="text-gray-400">·</span>
                        <time className="text-sm text-gray-500">{formatTimeAgo(new Date(post.createdAt))}</time>
                        <span className="text-gray-400">·</span>
                        <div className={`flex items-center space-x-1 text-xs font-medium ${
                          index === 0 ? "text-yellow-600" :
                          index === 1 ? "text-gray-600" :
                          index === 2 ? "text-orange-600" :
                          "text-blue-600"
                        }`}>
                          {index === 0 && <Crown className="h-3 w-3" />}
                          <span>#{index + 1} Trending</span>
                        </div>
                      </div>

                      {/* Title and Content */}
                      <Link href={`/post/${post.slug}`} className="block group">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        
                        {post.content && (
                          <p className="text-base text-gray-600 leading-relaxed mb-4 line-clamp-2 font-normal">
                            {post.content.length > 140 ? `${post.content.slice(0, 140)}...` : post.content}
                          </p>
                        )}
                      </Link>

                      {/* Bottom metadata */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center space-x-2">
                              {post.tags.slice(0, 2).map((tag: string) => (
                                <span key={tag} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Post type badge */}
                          <Badge 
                            variant="secondary" 
                            className={`${getPostTypeColor(post.type)} text-xs px-2 py-1 font-medium border-0 rounded-md`}
                          >
                            {getPostTypeIcon(post.type)}
                            <span className="ml-1">{post.type}</span>
                          </Badge>
                        </div>

                        {/* Engagement metrics */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">{formatNumber(post.voteCount)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span className="font-medium">{formatNumber(post.commentCount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail/Visual Element */}
                    <div className="flex-shrink-0 hidden md:block">
                      <Link href={`/post/${post.slug}`}>
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden group-hover:shadow-md transition-all duration-200 flex items-center justify-center">
                          {/* Random pattern/visual based on post type */}
                          <div className={`w-16 h-16 ${getPostTypeColor(post.type)} rounded-lg flex items-center justify-center opacity-60`}>
                            {getPostTypeIcon(post.type)}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 