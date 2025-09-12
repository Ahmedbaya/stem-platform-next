import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { action } = await req.json()
    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
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

    // Update team status
    const status = action === "approve" ? "approved" : "rejected"
    await db.collection("teams").updateOne(
      { _id: new ObjectId(params.teamId) },
      { 
        $set: { 
          status,
          ...(status === "approved" ? { approvedAt: new Date() } : {})
        } 
      }
    )

    return NextResponse.json({ 
      success: true,
      message: `Team ${status} successfully`
    })
  } catch (error) {
    console.error("[TEAMS_APPROVE]", error)
    return NextResponse.json({ 
      error: "Internal Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 