import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove sensitive information
    const { password, ...safeUser } = user

    return NextResponse.json({
      session: {
        ...session,
        user: {
          ...session.user,
          role: (session.user as any).role
        }
      },
      dbUser: safeUser
    })
  } catch (error) {
    console.error("Error checking user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 