import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session:", session)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body)
    const { name, email, image } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Update user profile with upsert
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          name,
          email,
          image,
          updatedAt: new Date(),
        },
      },
      { upsert: true } // Create if doesn't exist
    )
    console.log("Database result:", result)

    return NextResponse.json({ 
      message: "Profile updated successfully",
      updated: result.modifiedCount > 0,
      created: result.upsertedCount > 0
    }, { status: 200 })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 