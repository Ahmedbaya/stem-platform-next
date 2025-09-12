import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { CompetitionsList } from "@/components/competitions-list"

interface Competition {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  status: "draft" | "published" | "ongoing" | "completed"
  maxTeams: number
  teams?: any[]
  prizePool?: string
}

export default async function CompetitionsPage() {
  // const session = await getServerSession(authOptions)

  // if (!session?.user?.email) {
  //   redirect("/login")
  // }

  try {
    const client = await clientPromise
    const db = client.db()

    // Get all competitions (removed status filter for now)
    const competitions = await db
      .collection("competitions")
      .find({})
      .toArray()

    // Get all teams to show team counts
    const teams = await db
      .collection("teams")
      .find({
        competitionId: { 
          $in: competitions.map(c => c._id)
        }
      })
      .toArray()

    const formattedCompetitions: Competition[] = competitions.map(competition => ({
      _id: competition._id.toString(),
      title: competition.title || 'Untitled Competition',
      description: competition.description || 'No description available',
      startDate: competition.startDate || new Date().toISOString(),
      endDate: competition.endDate || new Date().toISOString(),
      location: competition.location || 'TBD',
      status: competition.status || 'published',
      maxTeams: competition.maxTeams || 10,
      prizePool: competition.prizePool,
      teams: teams.filter(team => team.competitionId.toString() === competition._id.toString())
    }))

    if (formattedCompetitions.length === 0) {
      return (
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">Available Competitions</h1>
          <div className="text-center text-muted-foreground">
            No competitions available at the moment.
          </div>
        </div>
      )
    }

    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Available Competitions</h1>
        <CompetitionsList 
          competitions={formattedCompetitions}
          showParticipatingOnly={false}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading competitions:', error)
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Available Competitions</h1>
        <div className="text-center text-muted-foreground">
          Failed to load competitions. Please try again later.
        </div>
      </div>
    )
  }
}
