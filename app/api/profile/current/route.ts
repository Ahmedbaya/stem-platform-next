import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const userProfile = await db
      .collection("users")
      .findOne({ email: session.user.email })

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: userProfile._id.toString(),
      name: userProfile.name || session.user.name,
      email: userProfile.email,
      image: userProfile.image || session.user.image,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 