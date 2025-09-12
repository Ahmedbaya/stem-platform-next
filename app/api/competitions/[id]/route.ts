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
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the competition to check ownership
    const competition = await db
      .collection("competitions")
      .findOne({ _id: new ObjectId(params.id) })

    if (!competition) {
      return new NextResponse("Competition not found", { status: 404 })
    }

    // Check if user is the organizer or admin
    const userRole = (session.user as any).role
    if (competition.organizerId !== session.user.email && userRole !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()

    // Update the competition
    const result = await db
      .collection("competitions")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: body }
      )

    if (!result.modifiedCount) {
      return new NextResponse("Failed to update competition", { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error updating competition:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the competition to check ownership
    const competition = await db
      .collection("competitions")
      .findOne({ _id: new ObjectId(params.id) })

    if (!competition) {
      return new NextResponse("Competition not found", { status: 404 })
    }

    // Check if user is the organizer or admin
    const userRole = (session.user as any).role
    if (competition.organizerId !== session.user.email && userRole !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Delete the competition
    await db
      .collection("competitions")
      .deleteOne({ _id: new ObjectId(params.id) })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting competition:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 