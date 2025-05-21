import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Get user settings or create default ones
    const settings = await db.collection("settings").findOne({
      userEmail: session.user.email
    })

    if (!settings) {
      // Create default settings
      const defaultSettings = {
        userEmail: session.user.email,
        notifications: {
          email: true,
          push: true,
          competitionUpdates: true,
          newMessages: true
        },
        privacy: {
          profileVisibility: "public",
          showScore: true,
          showSubmissions: true
        },
        preferences: {
          language: "en",
          timezone: "UTC",
          theme: "system"
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: new Date(),
          sessionTimeout: 30
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection("settings").insertOne(defaultSettings)
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)

  } catch (error: any) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { section, key, value } = await request.json()

    if (!section || !key) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Update the specific setting
    const result = await db.collection("settings").updateOne(
      { userEmail: session.user.email },
      {
        $set: {
          [`${section}.${key}`]: value,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
} 