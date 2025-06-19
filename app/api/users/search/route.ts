import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json([])
    }

    // Search for users by name or username (if you have it)
    const users = await db.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: session.user.id // Exclude the current user
            }
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive"
                }
              },
              {
                email: {
                  contains: query,
                  mode: "insensitive"
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10 // Limit results
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 