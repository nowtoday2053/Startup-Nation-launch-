"use client"

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ChevronDown,
  MessageCircle,
  Heart,
  Share,
  BookmarkPlus,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { formatTimeAgo, formatNumber } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

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
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    username?: string
    image?: string
  }
  replies?: Comment[]
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [params.slug])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/slug/${params.slug}`)
      if (response.ok) {
        const postData = await response.json()
        setPost(postData)
        setLikeCount(0)
      } else {
        console.error("Post not found")
        setPost(null)
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      setPost(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      // No mock comments - start with empty array
      setComments([])
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }



  const handleLike = () => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like posts",
        variant: "destructive",
      })
      return
    }

    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleComment = async () => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to comment",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      createdAt: new Date().toISOString(),
      author: {
        id: session.user?.id || "",
        name: session.user?.name || "",
        username: session.user?.email?.split("@")[0] || "",
        image: session.user?.image || ""
      }
    }

    setComments(prev => [comment, ...prev])
    setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null)
    setNewComment("")
    
    toast({
      title: "Comment posted!",
      description: "Your comment has been added successfully",
    })
  }

  const getPostTypeIcon = () => {
    if (!post) return <Sparkles className="h-5 w-5" />
    
    switch (post.type) {
      case "RESOURCE":
        return <ExternalLink className="h-5 w-5" />
      case "STRATEGY":
        return <TrendingUp className="h-5 w-5" />
      case "STORY":
        return <MessageSquare className="h-5 w-5" />
      default:
        return <Sparkles className="h-5 w-5" />
    }
  }

  const getPostTypeColor = () => {
    if (!post) return "bg-gray-500"
    
    switch (post.type) {
      case "RESOURCE":
        return "bg-blue-500"
      case "STRATEGY":
        return "bg-green-500"
      case "STORY":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getShareUrl = () => {
    return `${window.location.origin}/post/${params.slug}`
  }

  const shareToTwitter = () => {
    if (!post) return
    const text = `Check out this ${post.type.toLowerCase()}: "${post.title}"`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`
    window.open(url, '_blank')
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`
    window.open(url, '_blank')
  }

  const shareViaEmail = () => {
    if (!post) return
    const subject = `Check out: ${post.title}`
    const body = `I thought you might find this ${post.type.toLowerCase()} interesting:\n\n"${post.title}"\n\n${getShareUrl()}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl())
      toast({
        title: "Link copied!",
        description: "The post link has been copied to your clipboard.",
      })
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link href="/feed">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
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
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article>
          {/* Post Title */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {post.title}
            </h1>
          </header>

          {/* Author info and metadata */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Link href={`/profile/${post.author?.id}`}>
                <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity cursor-pointer">
                  <AvatarImage src={post.author?.image || ""} />
                  <AvatarFallback className="bg-gray-200 text-gray-600">
                    {post.author?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <Link href={`/profile/${post.author?.id}`} className="font-medium text-gray-900 hover:text-gray-700 transition-colors">
                    {post.author?.name || "Anonymous"}
                  </Link>
                  <span className="text-gray-400">·</span>
                  <time className="text-sm text-gray-500">{formatTimeAgo(new Date(post.createdAt))}</time>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={`${getPostTypeColor()} text-xs px-2 py-1 font-medium border-0 rounded-md`}
                  >
                    {getPostTypeIcon()}
                    <span className="ml-1">{post.type}</span>
                  </Badge>
                  <span className="text-xs text-gray-500">·</span>
                  <span className="text-xs text-gray-500">{Math.ceil((post.content?.length || 0) / 200)} min read</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share className="h-4 w-4" />
                </button>
                
                {showShareMenu && (
                  <div ref={shareMenuRef} className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                    <button
                      onClick={() => {
                        shareToTwitter()
                        setShowShareMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      <span>Share on Twitter</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        shareToLinkedIn()
                        setShowShareMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span>Share on LinkedIn</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        copyToClipboard()
                        setShowShareMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Link</span>
                    </button>
                  </div>
                )}
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                <BookmarkPlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none mb-12">
            {post.content && (
              <div className="text-gray-800 leading-relaxed">
                {post.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-2xl font-bold text-gray-900 mt-10 mb-6 leading-tight">
                        {paragraph.replace('## ', '')}
                      </h2>
                    )
                  }
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <p key={index} className="font-semibold text-gray-900 mb-6 text-lg bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                        {paragraph.replace(/^\*\*|\*\*$/g, '')}
                      </p>
                    )
                  }
                  return (
                    <p key={index} className="mb-6 leading-relaxed text-lg text-gray-800">
                      {paragraph}
                    </p>
                  )
                })}
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12 pb-8 border-b border-gray-200">
              {post.tags.map((tag: string) => (
                <span key={tag} className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement Bar - Bottom */}
          <div className="flex items-center justify-between py-6 mb-8 border-y border-gray-200">
            <div className="flex items-center space-x-8">
              <button 
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="font-medium text-sm">{formatNumber(likeCount)}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{formatNumber(post.commentCount || 0)} responses</span>
            </div>
          </div>

          {/* URL Preview */}
          {post.url && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ExternalLink className="h-4 w-4" />
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors font-medium">
                  {post.url}
                </a>
              </div>
            </div>
          )}
        </article>

        {/* Comments Section */}
        <section className="mt-16">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Responses ({comments.length})
            </h2>
            <div className="w-16 h-0.5 bg-gray-900"></div>
          </div>

          {/* Add Comment */}
          {session && (
            <div className="flex space-x-4 mb-12 pb-8 border-b border-gray-200">
              <Avatar className="h-10 w-10 mt-1">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-gray-100 text-gray-700">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-gray-400 resize-none text-base"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-400">
                    {newComment.length}/1000
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewComment("")}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={!newComment.trim()}
                      onClick={handleComment}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-1.5 text-sm font-medium"
                    >
                      Respond
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-8">
            {comments.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No responses yet</p>
                <p className="text-gray-400">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-8 last:border-b-0">
                  <div className="flex space-x-4">
                    <Avatar className="h-9 w-9 mt-1">
                      <AvatarImage src={comment.author.image || ""} />
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-sm">
                        {comment.author.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <Link href={`/profile/${comment.author.id}`} className="font-medium text-gray-900 hover:text-gray-700 transition-colors text-sm">
                          {comment.author.name}
                        </Link>
                        <span className="text-gray-400">·</span>
                        <time className="text-xs text-gray-500">{formatTimeAgo(new Date(comment.createdAt))}</time>
                      </div>
                      <p className="text-gray-800 leading-relaxed mb-4">{comment.content}</p>
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>Like</span>
                        </button>
                        <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
} 