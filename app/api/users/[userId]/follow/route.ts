import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.id === params.userId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      )
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: params.userId,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: { id: existingFollow.id },
      })
      return NextResponse.json({ following: false })
    } else {
      // Follow
      await db.follow.create({
        data: {
          followerId: session.user.id,
          followingId: params.userId,
        },
      })
      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error("Error following/unfollowing user:", error)
    return NextResponse.json(
      { error: "Failed to update follow status" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ following: false })
    }

    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: params.userId,
        },
      },
    })

    return NextResponse.json({ following: !!follow })
  } catch (error) {
    console.error("Error checking follow status:", error)
    return NextResponse.json({ following: false })
  }
} 