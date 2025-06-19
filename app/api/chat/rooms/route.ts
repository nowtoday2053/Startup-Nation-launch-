import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createRoomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["DIRECT", "GROUP"]),
  userIds: z.array(z.string()).min(1).max(50),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatRooms = await db.chatRoom.findMany({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(chatRooms)
  } catch (error) {
    console.error("Error fetching chat rooms:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat rooms" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, userIds } = createRoomSchema.parse(body)

    // Add current user to the room
    const allUserIds = [...new Set([session.user.id, ...userIds])]

    // For direct messages, check if room already exists
    if (type === "DIRECT" && allUserIds.length === 2) {
      const existingRoom = await db.chatRoom.findFirst({
        where: {
          type: "DIRECT",
          users: {
            every: {
              id: {
                in: allUserIds,
              },
            },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      })

      if (existingRoom) {
        return NextResponse.json(existingRoom)
      }
    }

    const chatRoom = await db.chatRoom.create({
      data: {
        name,
        type,
        users: {
          connect: allUserIds.map(id => ({ id })),
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    return NextResponse.json(chatRoom, { status: 201 })
  } catch (error) {
    console.error("Error creating chat room:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create chat room" },
      { status: 500 }
    )
  }
} 