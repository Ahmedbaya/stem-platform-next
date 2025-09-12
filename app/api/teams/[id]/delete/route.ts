import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function POST(
  req: Request,
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

    // Delete the team
    await db
      .collection("teams")
      .deleteOne({ _id: new ObjectId(params.id) })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TEAM_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 