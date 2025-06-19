"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  TrendingUp, 
  MessageSquare, 
  ExternalLink, 
  Plus,
  Filter,
  Search,
  Heart,
  BookmarkPlus,
  Sparkles,
  ChevronDown,
  MessageCircle,
  Share,
  Eye,
  User,
  LogOut,
  ChevronDown as ChevronDownIcon,
  MoreHorizontal
} from "lucide-react"
import Link from "next/link"
import { formatTimeAgo, formatNumber } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Post {
  id: string
  title: string
  content?: string
  url?: string
  type: "RESOURCE" | "STRATEGY" | "STORY"
  tags: string[]
  slug: string
  commentCount: number
  createdAt: string
  author: {
    id: string
    name: string
    username?: string
    email?: string
    image?: string
  }
  _count: {
    comments: number
  }
}

export default function FeedPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const { toast } = useToast()
  const [showDropdown, setShowDropdown] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  useEffect(() => {
    // For authenticated users, assume onboarding is completed
    if (session && status === "authenticated") {
      console.log("User authenticated, setting onboarding as checked")
      setOnboardingChecked(true)
    }
  }, [session, status])

  useEffect(() => {
    fetchPosts()
  }, [selectedType, selectedTags, searchQuery])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedType !== "ALL") params.append("type", selectedType)
      if (selectedTags.length > 0) params.append("tags", selectedTags.join(","))
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        // Process posts to include userVote information
        const processedPosts = data.posts.map((post: any) => ({
          ...post,
          userVote: post.votes && post.votes.length > 0 ? post.votes[0] : null,
          votes: undefined // Remove votes array from post object
        }))
        setPosts(processedPosts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || (session && !onboardingChecked)) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  }

  if (!session) {
    return null
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
              <Link href="/explore" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
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
        <FeedContent 
          posts={posts} 
          setPosts={setPosts}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          session={session}
          toast={toast}
        />
      </main>
    </div>
  )
}

function FeedContent({ posts, setPosts, isLoading, searchQuery, setSearchQuery, session, toast }: {
  posts: Post[]
  setPosts: (posts: Post[]) => void
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  session: any
  toast: any
}) {
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})
  const [comments, setComments] = useState<{ [key: string]: any[] }>({})
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})

  const toggleComments = async (postId: string) => {
    if (!showComments[postId]) {
      // Fetch comments
      try {
        const response = await fetch(`/api/posts/${postId}/comments`)
        if (response.ok) {
          const postComments = await response.json()
          setComments(prev => ({ ...prev, [postId]: postComments }))
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      }
    }
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  const handleComment = async (postId: string, content: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const newCommentData = await response.json()
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newCommentData]
        }))
        setNewComment(prev => ({ ...prev, [postId]: "" }))
        toast({
          title: "Success",
          description: "Comment added successfully",
        })
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-3xl shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources, strategies, and stories..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="max-w-4xl mx-auto space-y-12">
        {isLoading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <Card className="bg-white border border-gray-100 rounded-2xl shadow-sm">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-500 mb-6">Be the first to share something with the community!</p>
              <Button asChild className="bg-black hover:bg-gray-800 text-white rounded-lg px-6 py-2 font-medium">
                <Link href="/submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Content
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onToggleComments={toggleComments}
              showComments={showComments[post.id] || false}
              comments={comments[post.id] || []}
              newComment={newComment[post.id] || ""}
              setNewComment={(content) => setNewComment(prev => ({ ...prev, [post.id]: content }))}
              onComment={handleComment}
              session={session}
            />
          ))
        )}
      </div>
    </div>
  )
}

function PostCard({ 
  post, 
  onToggleComments, 
  showComments, 
  comments, 
  newComment, 
  setNewComment, 
  onComment, 
  session 
}: { 
  post: Post
  onToggleComments: (postId: string) => void
  showComments: boolean
  comments: any[]
  newComment: string
  setNewComment: (content: string) => void
  onComment: (postId: string, content: string) => void
  session: any
}) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const getPostTypeIcon = () => {
    switch (post.type) {
      case "RESOURCE":
        return <ExternalLink className="h-4 w-4" />
      case "STRATEGY":
        return <TrendingUp className="h-4 w-4" />
      case "STORY":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  const getPostTypeColor = () => {
    switch (post.type) {
      case "RESOURCE":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "STRATEGY":
        return "bg-green-100 text-green-700 border-green-200"
      case "STORY":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-white border-gray-100">
      <CardContent className="p-6">
        {/* Header with author and post type */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Link href={`/profile/${post.author.id}`}>
              <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage src={post.author.image || ""} />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                  {post.author.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${post.author.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm">
                {post.author.name}
              </Link>
              <p className="text-xs text-gray-500">{formatTimeAgo(new Date(post.createdAt))}</p>
            </div>
          </div>
          
          <Badge 
            variant="secondary" 
            className={`text-xs font-medium border ${getPostTypeColor()}`}
          >
            <span className="flex items-center space-x-1">
              {getPostTypeIcon()}
              <span>{post.type}</span>
            </span>
          </Badge>
        </div>

        {/* Title and Content */}
        <Link href={`/post/${post.slug}`} className="block group-hover:no-underline">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
            {post.title}
          </h3>
          
          {post.content && (
            <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
              {post.content.length > 150 ? `${post.content.slice(0, 150)}...` : post.content}
            </p>
          )}
        </Link>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{post.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* URL Preview */}
        {post.url && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ExternalLink className="h-4 w-4" />
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors truncate">
                {post.url}
              </a>
            </div>
          </div>
        )}

        {/* Engagement bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button 
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
              onClick={() => onToggleComments(post.id)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{formatNumber(post.commentCount || 0)}</span>
            </button>
            
            <button 
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? "text-red-500" : "hover:text-red-500"
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{formatNumber(likeCount)}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <Share className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <BookmarkPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              {/* Add comment */}
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      disabled={!newComment.trim()}
                      onClick={() => onComment(post.id, newComment)}
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments list */}
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={comment.author.image || ""} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                      {comment.author.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(new Date(comment.createdAt))}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FilterChip({ label, active = false, count, onClick }: { 
  label: string; 
  active?: boolean; 
  count?: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active 
          ? "bg-blue-500 text-white shadow-lg" 
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {count && <span className={`text-xs ${active ? "text-blue-100" : "text-gray-400"}`}>{count}</span>}
      </div>
    </button>
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="bg-white border border-gray-100 rounded-3xl shadow-lg">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded-lg w-32" />
              </div>
              <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
              <div className="h-4 bg-gray-200 rounded-lg w-full" />
              <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
              <div className="flex space-x-2 pt-4">
                <div className="h-8 bg-gray-200 rounded-lg w-16" />
                <div className="h-8 bg-gray-200 rounded-lg w-16" />
                <div className="h-8 bg-gray-200 rounded-lg w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const trendingTopics = [
  { name: "AI in SaaS", posts: 23 },
  { name: "Product-Led Growth", posts: 18 },
  { name: "Customer Success", posts: 15 },
  { name: "Pricing Strategy", posts: 12 },
  { name: "User Onboarding", posts: 9 },
]