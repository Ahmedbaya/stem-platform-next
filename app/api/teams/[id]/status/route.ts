import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if ((session.user as any).role !== "organizer") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const { status } = await request.json()

    if (!status || !["approved", "rejected"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the team
    const team = await db
      .collection("teams")
      .findOne({ _id: new ObjectId(params.id) })

    if (!team) {
      return new NextResponse("Team not found", { status: 404 })
    }

    // Get the competition to verify ownership
    const competition = await db
      .collection("competitions")
      .findOne({ _id: new ObjectId(team.competitionId) })

    if (!competition) {
      return new NextResponse("Competition not found", { status: 404 })
    }

    if (competition.organizerId !== session.user.email) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Update team status
    await db
      .collection("teams")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: { status, updatedAt: new Date() } }
      )

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TEAM_STATUS_UPDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 