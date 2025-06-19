"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User,
  Calendar,
  MapPin,
  ExternalLink,
  MessageCircle,
  Heart,
  Sparkles,
  Users,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Edit
} from "lucide-react"
import Link from "next/link"
import { formatTimeAgo, formatNumber } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface UserProfile {
  id: string
  name: string
  username?: string
  email: string
  image?: string
  bio?: string
  createdAt: string
  _count: {
    posts: number
    followers: number
    follows: number
  }
}

interface Post {
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
  _count: {
    comments: number
    votes: number
  }
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const { data: session } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("posts")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    username: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUserProfile()
    fetchUserPosts()
    if (session?.user?.id && session.user.id !== params.userId) {
      checkFollowStatus()
    }
  }, [params.userId, session])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.userId}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Fallback: if API fails and this is the current user, use session data
        if (session?.user && (session.user.id === params.userId || session.user.email === params.userId)) {
          const mockUser: UserProfile = {
            id: session.user.id || params.userId,
            name: session.user.name || "Anonymous User",
            username: session.user.email?.split("@")[0],
            email: session.user.email || "",
            image: session.user.image || "",
            bio: "Welcome to my profile!",
            createdAt: new Date().toISOString(),
            _count: {
              posts: 0,
              followers: 0,
              follows: 0
            }
          }
          setUser(mockUser)
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      // Fallback: if API fails and this is the current user, use session data
      if (session?.user && (session.user.id === params.userId || session.user.email === params.userId)) {
        const mockUser: UserProfile = {
          id: session.user.id || params.userId,
          name: session.user.name || "Anonymous User",
          username: session.user.email?.split("@")[0],
          email: session.user.email || "",
          image: session.user.image || "",
          bio: "Welcome to my profile!",
          createdAt: new Date().toISOString(),
          _count: {
            posts: 0,
            followers: 0,
            follows: 0
          }
        }
        setUser(mockUser)
      }
    }
  }

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`/api/users/${params.userId}/posts`)
      if (response.ok) {
        const userPosts = await response.json()
        setPosts(userPosts)
      } else {
        // Fallback: provide empty posts array if API fails
        setPosts([])
      }
    } catch (error) {
      console.error("Error fetching user posts:", error)
      // Fallback: provide empty posts array if API fails
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${params.userId}/follow`)
      if (response.ok) {
        const { following } = await response.json()
        setIsFollowing(following)
      }
    } catch (error) {
      console.error("Error checking follow status:", error)
    }
  }

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/users/${params.userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setUser(prev => prev ? {
          ...prev,
          _count: {
            ...prev._count,
            followers: prev._count.followers + (isFollowing ? -1 : 1)
          }
        } : null)
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error)
    }
  }

  const handleMessage = async () => {
    try {
      // Create or find existing direct message room
      const response = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "DIRECT",
          userIds: [params.userId],
        }),
      })

      if (response.ok) {
        const chatRoom = await response.json()
        // Navigate to chat with the specific room selected
        window.location.href = `/chat?room=${chatRoom.id}`
      } else {
        console.error("Failed to create chat room")
      }
    } catch (error) {
      console.error("Error starting message:", error)
    }
  }

  const handleEditProfile = () => {
    setEditForm({
      name: user?.name || "",
      bio: user?.bio || "",
      username: user?.username || ""
    })
    setIsEditingProfile(true)
  }

  const handleSaveProfile = async () => {
    try {
      // Make API call to update user profile
      const response = await fetch(`/api/users/${params.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          username: editForm.username,
          bio: editForm.bio,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        toast({
          title: "Profile updated!",
          description: "Your profile has been updated successfully.",
        });
        setIsEditingProfile(false);
      } else {
        const error = await response.json();
        console.error("API Error:", error);
        console.error("Response status:", response.status);
        toast({
          title: "Error updating profile",
          description: error.error || error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      
      // Fallback: update local state if API fails
      if (user) {
        const updatedUser = {
          ...user,
          name: editForm.name,
          bio: editForm.bio,
          username: editForm.username
        }
        setUser(updatedUser)
        
        toast({
          title: "Profile updated locally",
          description: "Changes saved locally. Database update failed.",
        })
        
        setIsEditingProfile(false)
      }
    }
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setEditForm({
      name: "",
      bio: "",
      username: ""
    })
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
          <Link href="/feed">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = session?.user?.id === params.userId

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-70">
              <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">Startup Nation</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-100 rounded-3xl shadow-lg">
              <CardContent className="p-8 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-6 border-4 border-gray-100">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback className="bg-gray-100 text-gray-700 text-2xl">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h1>
                <p className="text-gray-600 mb-4">@{user.username || user.email.split("@")[0]}</p>
                
                {user.bio && (
                  <p className="text-gray-700 mb-6 text-sm leading-relaxed">{user.bio}</p>
                )}

                <div className="flex items-center justify-center space-x-6 mb-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{formatNumber(user._count.posts)}</div>
                    <div className="text-gray-500">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{formatNumber(user._count.followers)}</div>
                    <div className="text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{formatNumber(user._count.follows)}</div>
                    <div className="text-gray-500">Following</div>
                  </div>
                </div>

                {isOwnProfile ? (
                  <Button 
                    onClick={handleEditProfile}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleFollow}
                      className={`w-full rounded-xl ${
                        isFollowing 
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-900" 
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl" onClick={handleMessage}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-2 mt-6 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatTimeAgo(new Date(user.createdAt))}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex space-x-1 mb-8 bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === "posts"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab("liked")}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === "liked"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Liked
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === "comments"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Comments
              </button>
            </div>

            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <Card className="bg-white border border-gray-100 rounded-3xl shadow-lg">
                    <CardContent className="p-12 text-center">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                      <p className="text-gray-500">
                        {isOwnProfile ? "Share your first post with the community!" : "This user hasn't shared anything yet."}
                      </p>
                      {isOwnProfile && (
                        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl mt-4">
                          <Link href="/submit">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Create Post
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="bg-white border border-gray-100 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-8">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge className={`${getPostTypeColor(post.type)} border-0 rounded-lg text-xs px-2 py-1`}>
                                {getPostTypeIcon(post.type)}
                                <span className="ml-1">{post.type}</span>
                              </Badge>
                              <span className="text-sm text-gray-500">{formatTimeAgo(new Date(post.createdAt))}</span>
                            </div>

                            <Link href={`/post/${post.slug}`}>
                              <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight mb-3">
                                {post.title}
                              </h3>
                            </Link>

                            {post.content && (
                              <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
                                {post.content.slice(0, 200)}...
                              </p>
                            )}

                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.slice(0, 3).map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {formatNumber(post.commentCount)}
                              </span>
                              <span className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                {formatNumber(post.voteCount)}
                              </span>
                              {post.url && (
                                <Link href={post.url} target="_blank" className="flex items-center text-blue-500 hover:text-blue-600">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Liked Tab */}
            {activeTab === "liked" && (
              <Card className="bg-white border border-gray-100 rounded-3xl shadow-lg">
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No liked posts yet</h3>
                  <p className="text-gray-500">
                    {isOwnProfile ? "Posts you like will appear here." : "This user's liked posts will appear here."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <Card className="bg-white border border-gray-100 rounded-3xl shadow-lg">
                <CardContent className="p-12 text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-500">
                    {isOwnProfile ? "Your comments on posts will appear here." : "This user's comments will appear here."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="Your name"
                  />
                </div>

                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="Your username"
                  />
                </div>

                {/* Bio Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900"
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {editForm.bio.length}/500 characters
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 