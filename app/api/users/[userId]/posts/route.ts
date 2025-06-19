import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const posts = await db.post.findMany({
      where: {
        authorId: params.userId,
        published: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        url: true,
        type: true,
        tags: true,
        slug: true,
        voteCount: true,
        commentCount: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch user posts" },
      { status: 500 }
    )
  }
} 