import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { nanoid } from "nanoid"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const { name, description } = body

    console.log("Creating team with:", { name, description, competitionId: id })

    const client = await clientPromise
    const db = client.db()

    // Check if competition exists and is in registration phase
    const competition = await db
      .collection("competitions")
      .findOne({ _id: new ObjectId(id) })

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }

    // Check if registration is still open
    const now = new Date()
    
    // Helper function to parse date strings
    const parseDate = (dateStr: string) => {
      if (!dateStr) {
        console.error("Empty date string provided")
        return null
      }

      try {
        // Try parsing as ISO string first
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          return date
        }
        
        console.error("Failed to parse date string:", dateStr)
        return null
      } catch (error) {
        console.error("Error parsing date string:", dateStr, error)
        return null
      }
    }
    
    // Validate registration deadline
    const registrationDeadline = competition.registrationDeadline ? parseDate(competition.registrationDeadline) : null
    if (!registrationDeadline) {
      console.error("Invalid registration deadline:", {
        providedDeadline: competition.registrationDeadline,
        competitionId: id,
        competition: JSON.stringify(competition)
      })
      return NextResponse.json({ 
        error: "Invalid competition registration deadline",
        details: {
          providedDeadline: competition.registrationDeadline,
          competitionId: id,
          message: "Could not parse the registration deadline into a valid date"
        }
      }, { status: 400 })
    }

    // Validate start date
    const startDate = competition.startDate ? parseDate(competition.startDate) : null
    if (!startDate) {
      console.error("Invalid start date:", {
        providedStartDate: competition.startDate,
        competitionId: id,
        competition: JSON.stringify(competition)
      })
      return NextResponse.json({ 
        error: "Invalid competition start date",
        details: {
          providedStartDate: competition.startDate,
          competitionId: id,
          message: "Could not parse the start date into a valid date"
        }
      }, { status: 400 })
    }

    console.log("Competition dates:", {
      competitionId: id,
      now: now.toISOString(),
      registrationDeadline: competition.registrationDeadline,
      parsedRegistrationDeadline: registrationDeadline.toISOString(),
      startDate: competition.startDate,
      parsedStartDate: startDate.toISOString(),
      isPastDeadline: now > registrationDeadline,
      isPastStart: now > startDate
    })

    // Only check registration deadline, ignore start date for now
    if (now > registrationDeadline) {
      return NextResponse.json({
        error: "Registration deadline has passed",
        details: {
          now: now.toISOString(),
          registrationDeadline: registrationDeadline.toISOString(),
          isPastDeadline: now > registrationDeadline
        }
      }, { status: 400 })
    }

    // Check if user is already in a team for this competition
    const existingTeam = await db.collection("teams").findOne({
      competitionId: new ObjectId(id),
      status: { $in: ["pending", "approved"] },
      $or: [
        { members: session.user.email },
        { leader: session.user.email }
      ]
    })

    if (existingTeam) {
      return NextResponse.json({
        error: "You already have a pending or approved team in this competition",
        teamId: existingTeam._id
      }, { status: 400 })
    }

    // Check if maximum teams limit has been reached
    const teamCount = await db.collection("teams").countDocuments({
      competitionId: new ObjectId(id),
    })

    if (teamCount >= competition.maxTeams) {
      return NextResponse.json({
        error: "Maximum number of teams reached for this competition"
      }, { status: 400 })
    }

    // Create team with a unique code (will be revealed after approval)
    const team = await db.collection("teams").insertOne({
      name,
      description,
      competitionId: new ObjectId(id),
      leader: session.user.email,
      members: [session.user.email],
      status: "pending",
      code: nanoid(8), // Generate 8-character unique code
      createdAt: new Date(),
    })

    // Add team reference to the competition using type assertion
    await db.collection("competitions").updateOne(
      { _id: new ObjectId(id) },
      { $push: { teams: team.insertedId.toString() } } as any
    )

    // Create notification for the organizer
    await db.collection("notifications").insertOne({
      type: "TEAM_REGISTRATION",
      title: "New Team Registration",
      message: `Team "${name}" has registered for your competition "${competition.title}"`,
      recipientEmail: competition.organizerId,
      competitionId: new ObjectId(id),
      teamId: team.insertedId,
      read: false,
      createdAt: new Date()
    })

    return NextResponse.json({ 
      success: true,
      teamId: team.insertedId 
    }, { status: 201 })
  } catch (error) {
    console.error("[TEAMS_POST]", error)
    return NextResponse.json({ 
      error: "Internal Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 