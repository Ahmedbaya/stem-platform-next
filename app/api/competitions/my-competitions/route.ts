import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get all competitions
    const competitions = await db
      .collection("competitions")
      .find({})
      .sort({ startDate: 1 })
      .toArray()

    // Format competitions with consistent fields
    const formattedCompetitions = await Promise.all(competitions.map(async competition => {
      // Fetch team details for this competition
      const teamDetails = await db
        .collection("teams")
        .find({
          competitionId: competition._id,
        })
        .toArray()

      // Fetch organizer details
      const organizer = await db
        .collection("users")
        .findOne({ email: competition.organizerId })

      return {
        _id: competition._id.toString(),
        title: competition.title || 'Untitled Competition',
        description: competition.description || 'No description available',
        startDate: competition.startDate || new Date().toISOString(),
        endDate: competition.endDate || new Date().toISOString(),
        registrationDeadline: competition.registrationDeadline || new Date().toISOString(),
        location: competition.location || 'TBD',
        status: competition.status || 'published',
        maxTeams: competition.maxTeams || 10,
        teams: competition.teams || [],
        teamDetails: teamDetails.map(team => ({
          _id: team._id.toString(),
          name: team.name,
          status: team.status,
          leader: team.leader,
          members: team.members,
          code: team.code,
          createdAt: team.createdAt
        })),
        organizerId: competition.organizerId,
        organizerName: organizer?.name || 'Unknown Organizer',
        image: competition.image || '/placeholder.svg?height=200&width=400',
        prizePool: competition.prizePool,
        createdAt: competition.createdAt || new Date().toISOString(),
        updatedAt: competition.updatedAt || new Date().toISOString()
      }
    }))

    return NextResponse.json(formattedCompetitions)
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 