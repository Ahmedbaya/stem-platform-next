import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { UserRole } from "@/lib/auth-types"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const userRole = (session.user as any).role
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params
    const body = await req.json()
    const { role } = body

    // Validate role
    const validRoles = ["admin", "organizer", "judge", "participant", "spectator"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Prevent admin from changing their own role
    if (session.user.email === id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      )
    }

    // Update user role
    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            role,
            roleUpdatedAt: new Date(), // Add timestamp for role update
            needsSessionRefresh: true // Flag to indicate session needs refresh
          } 
        }
      )

    if (!result.matchedCount) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!result.modifiedCount) {
      return NextResponse.json(
        { error: "Failed to update user role" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Please sign out and sign back in to apply your new role."
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const userRole = (session.user as any).role
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    const client = await clientPromise
    const db = client.db()

    // Get user to check if it's an admin
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent admin from deleting themselves
    if (session.user.email === user.email) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Delete the user
    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(id) })

    if (!result.deletedCount) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 