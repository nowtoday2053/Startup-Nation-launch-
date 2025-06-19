import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is member of the chat room
    const chatRoom = await db.chatRoom.findFirst({
      where: {
        id: params.roomId,
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
    })

    if (!chatRoom) {
      return NextResponse.json(
        { error: "Chat room not found or access denied" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const messages = await db.message.findMany({
      where: {
        chatRoomId: params.roomId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Reverse to show oldest first
    return NextResponse.json(messages.reverse())
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is member of the chat room
    const chatRoom = await db.chatRoom.findFirst({
      where: {
        id: params.roomId,
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
    })

    if (!chatRoom) {
      return NextResponse.json(
        { error: "Chat room not found or access denied" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { content } = sendMessageSchema.parse(body)

    const message = await db.message.create({
      data: {
        content,
        chatRoomId: params.roomId,
        senderId: session.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    })

    // Update chat room's updatedAt
    await db.chatRoom.update({
      where: { id: params.roomId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
} 