import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can update user status
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status } = await req.json()

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the user to check if they're an organizer
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(params.id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "organizer") {
      return NextResponse.json({ error: "Can only update status for organizers" }, { status: 400 })
    }

    // Update user status
    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { 
          $set: { 
            status,
            statusUpdatedAt: new Date(),
            ...(status === "approved" ? { approvedAt: new Date() } : {})
          } 
        }
      )

    if (!result.matchedCount) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!result.modifiedCount) {
      return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: status === "approved" 
        ? "Organizer account approved successfully" 
        : "Organizer account rejected"
    })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 