import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import { WithId, Document } from "mongodb"

interface Award {
  name: string
  prize?: string
  description?: string
}

interface ExtendedSession {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the competition data from the request body
    const competition = await request.json()
    const { _id, ...updateData } = competition

    // Verify the user is the organizer of this competition
    const existingCompetition = await db.collection("competitions").findOne({
      _id: new ObjectId(_id),
      organizerId: session.user.email
    })

    if (!existingCompetition) {
      return NextResponse.json(
        { error: "Competition not found or unauthorized" },
        { status: 404 }
      )
    }

    // Update the competition
    const result = await db.collection("competitions").updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: "Failed to update competition" },
        { status: 500 }
      )
    }

    // Return the updated competition
    const updatedCompetition = await db.collection("competitions").findOne({
      _id: new ObjectId(_id)
    })

    if (!updatedCompetition) {
      return NextResponse.json(
        { error: "Failed to fetch updated competition" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...updatedCompetition,
      _id: updatedCompetition._id.toString()
    })
  } catch (error) {
    console.error("[UPDATE_COMPETITION]", error)
    return NextResponse.json(
      { error: "Failed to update competition" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session:", session)

    if (!session?.user?.email) {
      console.log("No session or email found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get and validate the competition data
    const competition = await request.json()
    console.log("Received competition data:", competition)

    // Basic validation
    if (!competition.title || !competition.description || !competition.startDate || 
        !competition.endDate || !competition.registrationDeadline || !competition.location || 
        !competition.maxTeams) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate dates
    const startDate = new Date(competition.startDate)
    const endDate = new Date(competition.endDate)
    const registrationDeadline = new Date(competition.registrationDeadline)

    if (registrationDeadline >= startDate) {
      return NextResponse.json(
        { error: "Registration deadline must be before the competition start date" },
        { status: 400 }
      )
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      )
    }

    // Validate evaluation criteria
    if (!competition.evaluationCriteria || competition.evaluationCriteria.length === 0) {
      return NextResponse.json(
        { error: "At least one evaluation criteria is required" },
        { status: 400 }
      )
    }

    const totalWeight = competition.evaluationCriteria.reduce(
      (sum: number, criteria: { weight: number }) => sum + criteria.weight,
      0
    )
    console.log("Total evaluation criteria weight:", totalWeight)

    if (totalWeight !== 100) {
      return NextResponse.json(
        { error: "Total weight of evaluation criteria must equal 100%" },
        { status: 400 }
      )
    }

    // Format the competition data
    const competitionWithDefaults = {
      title: competition.title.trim(),
      description: competition.description.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      registrationDeadline: registrationDeadline.toISOString(),
      location: competition.location.trim(),
      maxTeams: parseInt(competition.maxTeams.toString()),
      organizerId: session.user.email,
      organizerName: session.user.name,
      status: "draft",
      teams: [],
      awards: competition.awards || [],
      evaluationCriteria: competition.evaluationCriteria,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log("Formatted competition data:", competitionWithDefaults)

    const client = await clientPromise
    const db = client.db()

    // Insert the competition into the database
    const result = await db.collection("competitions").insertOne(competitionWithDefaults)
    console.log("Database insert result:", result)

    if (!result.insertedId) {
      return NextResponse.json(
        { error: "Failed to create competition" },
        { status: 500 }
      )
    }

    // Return the created competition with its ID
    const response = {
      ...competitionWithDefaults,
      _id: result.insertedId.toString()
    }
    console.log("Sending response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[CREATE_COMPETITION]", error)
    return NextResponse.json(
      { error: "Failed to create competition" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    // Get all competitions
    const competitions = await db
      .collection("competitions")
      .find()
      .sort({ startDate: 1 }) // Sort by start date ascending
      .toArray()

    const formattedCompetitions = competitions.map(competition => ({
      _id: competition._id.toString(),
      title: competition.title || 'Untitled Competition',
      description: competition.description || 'No description available',
      startDate: competition.startDate || new Date().toISOString(),
      endDate: competition.endDate || new Date().toISOString(),
      location: competition.location || 'TBD',
      status: competition.status || 'draft',
      organizerName: competition.organizerName || 'Unknown',
      maxTeams: competition.maxTeams || 10,
      prizePool: competition.prizePool,
      image: competition.image || '/placeholder.svg?height=200&width=400',
      categories: competition.categories || [],
      teams: competition.teams || []
    }))

    return NextResponse.json(formattedCompetitions)
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return NextResponse.json([], { status: 500 })
  }
} 