import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            follows: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log("Session:", session)
    console.log("Params userId:", params.userId)
    console.log("Session user id:", session?.user?.id)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }
    
    // Check if the user is trying to edit their own profile
    // Allow both direct ID match and email-based userId (for fallback profiles)
    if (session.user.id !== params.userId && session.user.email !== params.userId) {
      return NextResponse.json(
        { error: "Unauthorized - can only edit your own profile" },
        { status: 401 }
      )
    }

    const { name, username, bio } = await request.json()

    // Check if username is already taken (if it's being changed)
    if (username) {
      const notClause = params.userId.includes('@')
        ? { email: params.userId }
        : { id: params.userId }
        
      const existingUser = await db.user.findFirst({
        where: {
          username: username,
          NOT: notClause
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        )
      }
    }

    // Find user by ID or email (for fallback profiles)
    const whereClause = params.userId.includes('@') 
      ? { email: params.userId }
      : { id: params.userId }

    // First, check if the user exists
    const existingUser = await db.user.findUnique({
      where: whereClause
    })

    if (!existingUser) {
      // If user doesn't exist and we have session data, create the user first
      if (session.user.email) {
        // Generate a unique username if not provided
        let finalUsername = username || session.user.email.split('@')[0]
        
        // Check if username is taken and make it unique
        const existingUsername = await db.user.findUnique({
          where: { username: finalUsername }
        })
        
        if (existingUsername) {
          finalUsername = `${finalUsername}_${Date.now()}`
        }
        
        const newUser = await db.user.create({
          data: {
            name: name || session.user.name || "Anonymous User",
            email: session.user.email,
            username: finalUsername,
            bio: bio || "Welcome to my profile!",
            image: session.user.image || null,
          },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            bio: true,
            createdAt: true,
            _count: {
              select: {
                posts: true,
                followers: true,
                follows: true,
              },
            },
          },
        })
        return NextResponse.json(newUser)
      } else {
        return NextResponse.json(
          { error: "User not found and cannot be created" },
          { status: 404 }
        )
      }
    }

    // Update existing user
    const updatedUser = await db.user.update({
      where: whereClause,
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            follows: true,
          },
        },
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    )
  }
} 