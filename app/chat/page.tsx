"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Send,
  Plus,
  Search,
  Users,
  MessageCircle,
  Sparkles,
  User,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { formatTimeAgo } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ChatRoom {
  id: string
  name?: string
  type: "DIRECT" | "GROUP"
  users: Array<{
    id: string
    name: string
    username?: string
    image?: string
  }>
  messages: Array<{
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
      username?: string
    }
  }>
  _count: {
    messages: number
  }
}

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    name: string
    username?: string
    image?: string
  }
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [usernameSearch, setUsernameSearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatRooms()
  }, [])

  useEffect(() => {
    // Check for room parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const roomId = urlParams.get('room')
    
    if (roomId && chatRooms.length > 0) {
      const targetRoom = chatRooms.find(room => room.id === roomId)
      if (targetRoom) {
        setSelectedRoom(targetRoom)
        // Clear the URL parameter
        window.history.replaceState({}, '', '/chat')
      }
    } else if (chatRooms.length > 0 && !selectedRoom) {
      setSelectedRoom(chatRooms[0])
    }
  }, [chatRooms])

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id)
    }
  }, [selectedRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchChatRooms = async () => {
    try {
      const response = await fetch("/api/chat/rooms")
      if (response.ok) {
        const rooms = await response.json()
        setChatRooms(rooms)
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`)
      if (response.ok) {
        const roomMessages = await response.json()
        setMessages(roomMessages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageInput.trim() || !selectedRoom || isSending) return

    setIsSending(true)
    
    try {
      const response = await fetch(`/api/chat/rooms/${selectedRoom.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageInput.trim(),
        }),
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prev => [...prev, newMessage])
        setMessageInput("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.name) return room.name
    
    if (room.type === "DIRECT") {
      const otherUser = room.users.find(user => user.id !== session?.user?.id)
      return otherUser?.name || "Unknown User"
    }
    
    return `Group (${room.users.length})`
  }

  const getRoomDisplayImage = (room: ChatRoom) => {
    if (room.type === "DIRECT") {
      const otherUser = room.users.find(user => user.id !== session?.user?.id)
      return otherUser?.image
    }
    return null
  }

  const searchUsers = async () => {
    if (!usernameSearch.trim()) {
      setSearchResults([])
      setSearchError("")
      return
    }

    setIsSearching(true)
    setSearchError("")
    
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(usernameSearch.trim())}`)
      if (response.ok) {
        const users = await response.json()
        if (users.length === 0) {
          setSearchError("User doesn't exist")
        } else {
          setSearchResults(users)
        }
      } else {
        setSearchError("Error searching users")
      }
    } catch (error) {
      console.error("Error searching users:", error)
      setSearchError("Error searching users")
    } finally {
      setIsSearching(false)
    }
  }

  const startDirectMessage = async (userId: string) => {
    try {
      const response = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "DIRECT",
          userIds: [userId],
        }),
      })

      if (response.ok) {
        const newRoom = await response.json()
        setChatRooms(prev => [newRoom, ...prev])
        setSelectedRoom(newRoom)
        setShowNewChatModal(false)
        setUsernameSearch("")
        setSearchResults([])
        setSearchError("")
      }
    } catch (error) {
      console.error("Error creating chat room:", error)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access chat</h1>
          <Link href="/login">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-70">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Startup Nation</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/submit" className="text-gray-600 hover:text-blue-500 transition-colors font-medium">
              Create
            </Link>
            <Link href="/explore" className="text-gray-600 hover:text-blue-500 transition-colors font-medium">
              Explore
            </Link>
            <Link href="/chat" className="text-blue-500 font-semibold">
              Chat
            </Link>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl" asChild>
              <Link href="/submit">
                <Plus className="h-4 w-4 mr-2" />
                Submit
              </Link>
            </Button>
            
            {session?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                    <Avatar className="h-9 w-9 border-2 border-gray-100 hover:border-blue-300 transition-colors cursor-pointer">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {session.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{session.user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${session.user?.id}`} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
          {/* Chat Rooms Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-100 rounded-3xl shadow-lg h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center text-gray-900">
                    <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                    Chats
                  </CardTitle>
                  <Dialog open={showNewChatModal} onOpenChange={setShowNewChatModal}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="rounded-xl">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl">
                      <DialogHeader className="pb-6">
                        <DialogTitle className="text-xl font-bold text-gray-900">Start a New Chat</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Search for a username to start a direct message
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="username" className="text-sm font-semibold text-gray-900">Username</Label>
                          <div className="flex space-x-3">
                            <Input
                              id="username"
                              placeholder="Enter username..."
                              value={usernameSearch}
                              onChange={(e) => setUsernameSearch(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Button 
                              onClick={searchUsers} 
                              disabled={isSearching} 
                              className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                            >
                              {isSearching ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <Search className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {searchError && (
                          <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
                            {searchError}
                          </div>
                        )}
                        
                        {searchResults.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-900">Search Results</Label>
                            <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-50 rounded-xl p-3">
                              {searchResults.map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-200"
                                  onClick={() => startDirectMessage(user.id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10 border-2 border-gray-100">
                                      <AvatarImage src={user.image || ""} />
                                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                        {user.name?.charAt(0) || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-semibold text-gray-900">{user.name}</p>
                                      {user.username && (
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                      )}
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3 p-3 rounded-xl">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : chatRooms.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No conversations yet</p>
                    <p className="text-sm text-gray-400">Start chatting with community members</p>
                  </div>
                ) : (
                  chatRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        selectedRoom?.id === room.id ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getRoomDisplayImage(room) || ""} />
                        <AvatarFallback className="bg-gray-100 text-gray-700">
                          {room.type === "GROUP" ? <Users className="h-4 w-4" /> : getRoomDisplayName(room).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {getRoomDisplayName(room)}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {room.messages[0]?.content || "No messages yet"}
                        </p>
                      </div>
                      {room._count.messages > 0 && (
                        <span className="text-xs text-gray-400">
                          {room.messages[0] && formatTimeAgo(new Date(room.messages[0].createdAt))}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-3">
            <Card className="bg-white border border-gray-100 rounded-3xl shadow-lg h-full flex flex-col">
              {selectedRoom ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getRoomDisplayImage(selectedRoom) || ""} />
                        <AvatarFallback className="bg-gray-100 text-gray-700">
                          {selectedRoom.type === "GROUP" ? <Users className="h-4 w-4" /> : getRoomDisplayName(selectedRoom).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{getRoomDisplayName(selectedRoom)}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedRoom.type === "GROUP" ? `${selectedRoom.users.length} members` : "Direct message"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender.id === session.user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex max-w-[70%] ${message.sender.id === session.user?.id ? "flex-row-reverse" : "flex-row"}`}>
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={message.sender.image || ""} />
                              <AvatarFallback className="bg-gray-100 text-gray-700 text-sm">
                                {message.sender.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`mx-3 ${message.sender.id === session.user?.id ? "text-right" : "text-left"}`}>
                              <div className={`inline-block px-4 py-2 rounded-2xl ${
                                message.sender.id === session.user?.id
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}>
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimeAgo(new Date(message.createdAt))}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-100">
                    <form onSubmit={sendMessage} className="flex space-x-4">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSending}
                      />
                      <Button 
                        type="submit" 
                        disabled={!messageInput.trim() || isSending}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-6"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose from your existing conversations or start a new one</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 