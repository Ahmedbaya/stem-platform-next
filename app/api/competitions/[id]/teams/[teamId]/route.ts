import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if competition exists and user is the organizer
    const competition = await db
      .collection("competitions")
      .findOne({ _id: new ObjectId(params.id) })

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }

    // Check if user is organizer or admin
    if (competition.organizerId !== session.user.email && 
        (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Remove team from teams collection
    await db.collection("teams").deleteOne({
      _id: new ObjectId(params.teamId)
    })

    // Remove team reference from competition
    await db.collection("competitions").updateOne(
      { _id: new ObjectId(params.id) },
      { $pull: { teams: params.teamId } } as any
    )

    return NextResponse.json({ 
      success: true,
      message: "Team deleted successfully"
    })
  } catch (error) {
    console.error("[TEAMS_DELETE]", error)
    return NextResponse.json({ 
      error: "Internal Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 