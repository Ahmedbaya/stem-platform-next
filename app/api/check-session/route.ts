import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ needsRefresh: false })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the user from database
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ needsRefresh: false })
    }

    // Check if the role in the database matches the session
    const needsRefresh = user.role !== (session.user as any).role

    return NextResponse.json({ 
      needsRefresh,
      currentRole: (session.user as any).role,
      databaseRole: user.role
    })
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json({ needsRefresh: false })
  }
} 