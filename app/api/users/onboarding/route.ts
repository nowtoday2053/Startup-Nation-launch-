import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  country: z.string().min(1, "Country is required"),
  currentProject: z.string().min(1, "Current project is required"),
  hearAboutUs: z.string().min(1, "This field is required"),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, username, country, currentProject, hearAboutUs } = onboardingSchema.parse(body)

    // Check if username is already taken
    const existingUser = await db.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive"
        }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
    }

    // Update user with onboarding data
    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: {
        name,
        username,
        country,
        currentProject,
        hearAboutUs,
        onboardingCompleted: true,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Onboarding error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log("Session in onboarding API:", session)
    
    if (!session?.user?.email) {
      console.log("No session or email found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Checking onboarding for user:", session.user.email)

    let user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        onboardingCompleted: true,
        name: true,
        username: true,
        country: true,
        currentProject: true,
        hearAboutUs: true,
      },
    })

    // If user doesn't exist, create them (OAuth users)
    if (!user) {
      console.log("User not found, creating new user")
      const username = session.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
      user = await db.user.create({
        data: {
          name: session.user.name || '',
          email: session.user.email,
          image: session.user.image,
          username,
          onboardingCompleted: false,
        },
        select: {
          id: true,
          onboardingCompleted: true,
          name: true,
          username: true,
          country: true,
          currentProject: true,
          hearAboutUs: true,
        },
      })
    }

    console.log("User onboarding status:", user.onboardingCompleted)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching onboarding status:", error)
    return NextResponse.json(
      { error: "Failed to fetch onboarding status" },
      { status: 500 }
    )
  }
} 