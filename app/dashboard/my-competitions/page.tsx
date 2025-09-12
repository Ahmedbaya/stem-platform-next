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

export default async function MyCompetitionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const client = await clientPromise
  const db = client.db()

  // Get competitions created by the current organizer
  const competitions = await db
    .collection("competitions")
    .find({
      organizerId: session.user.email
    })
    .toArray()

  console.log('Found competitions:', competitions)

  const formattedCompetitions: Competition[] = competitions.map(competition => ({
    _id: competition._id.toString(),
    title: competition.title,
    description: competition.description,
    startDate: competition.startDate,
    endDate: competition.endDate,
    location: competition.location,
    status: competition.status || 'published',
    maxTeams: competition.maxTeams || 10,
    prizePool: competition.prizePool,
    teams: competition.teams || []
  }))

  console.log('Formatted competitions:', formattedCompetitions)

  if (formattedCompetitions.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Competitions</h1>
        <div className="text-center text-muted-foreground">
          You haven't created any competitions yet.
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Competitions</h1>
      <CompetitionsList 
        competitions={formattedCompetitions}
        showParticipatingOnly={false}
      />
    </div>
  )
} 