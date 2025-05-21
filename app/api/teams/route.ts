import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, description, competitionId } = body

    const client = await clientPromise
    const db = client.db()

    // Validate competition exists and is in registration phase
    const competition = await db.collection("competitions").findOne({ _id: new ObjectId(competitionId) })

    if (!competition) {
      return new NextResponse("Competition not found", { status: 404 })
    }

    if (competition.status !== "registration") {
      return new NextResponse("Competition is not accepting registrations", { status: 400 })
    }

    // Create the team
    const team = await db.collection("teams").insertOne({
      name,
      description,
      competitionId,
      captainId: session.user.email,
      members: [{
        userId: session.user.email,
        role: "CAPTAIN"
      }]
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("[TEAMS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 