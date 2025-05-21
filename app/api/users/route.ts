import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Fetch all users, excluding sensitive information
    const users = await db.collection("users")
      .find({}, { 
        projection: { 
          password: 0, // Exclude password
          emailVerified: 0,
          // Add other sensitive fields to exclude here
        } 
      })
      .toArray()

    return NextResponse.json(users)

  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
} 