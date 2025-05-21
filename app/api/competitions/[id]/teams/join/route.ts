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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const { code } = body
    const email = session.user.email // Use the authenticated user's email

    if (!code) {
      return NextResponse.json({ error: "Team code is required" }, { status: 400 })
    }

    console.log("Joining team:", { competitionId: id, code, email })

    const client = await clientPromise
    const db = client.db()

    // Check if competition exists and is open for registration
    const competition = await db
      .collection("competitions")
      .findOne({ _id: new ObjectId(id) })

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }

    // Check if registration is still open
    const now = new Date()
    const registrationDeadline = new Date(competition.registrationDeadline)

    if (now > registrationDeadline) {
      return NextResponse.json({ 
        error: "Registration deadline has passed",
        details: {
          now: now.toISOString(),
          deadline: registrationDeadline.toISOString()
        }
      }, { status: 400 })
    }

    // Check if user is already in a team for this competition
    const existingTeam = await db.collection("teams").findOne({
      competitionId: new ObjectId(id),
      status: { $in: ["pending", "approved"] },
      $or: [
        { members: email },
        { leader: email }
      ]
    })

    if (existingTeam) {
      return NextResponse.json({ 
        error: "You already have a pending or approved team in this competition",
        teamId: existingTeam._id.toString()
      }, { status: 400 })
    }

    // Find team by code and competition
    const team = await db.collection("teams").findOne({
      competitionId: new ObjectId(id),
      code: code,
      status: "approved", // Can only join approved teams
    })

    if (!team) {
      return NextResponse.json({ 
        error: "Invalid team code or team not approved" 
      }, { status: 400 })
    }

    // Check if team is full (using maxTeamSize from competition or default to 4)
    const maxTeamSize = competition.maxTeamSize || 4
    if (team.members.length >= maxTeamSize) {
      return NextResponse.json({ 
        error: "Team is full",
        details: {
          currentSize: team.members.length,
          maxSize: maxTeamSize
        }
      }, { status: 400 })
    }

    // Add member to team
    await db.collection("teams").updateOne(
      { _id: team._id },
      { $addToSet: { members: email } }
    )

    return NextResponse.json({ 
      success: true,
      teamId: team._id.toString()
    })
  } catch (error) {
    console.error("[TEAMS_JOIN_POST]", error)
    return NextResponse.json({ 
      error: "Internal Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 