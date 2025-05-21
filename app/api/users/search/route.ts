import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""

    const client = await clientPromise
    const db = client.db()
    
    // Search users by name or email, excluding the current user
    const users = await db.collection("users")
      .find({
        email: { $ne: session.user.email }, // Exclude current user
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } }
        ]
      }, {
        projection: {
          password: 0, // Exclude password
          emailVerified: 0,
          // Add other sensitive fields to exclude here
        }
      })
      .limit(10)
      .toArray()

    return NextResponse.json(users)

  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    )
  }
} 