import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { EditCompetitionForm } from "@/components/competitions/edit-competition-form"
import { Competition } from "@/types/competition"

async function getCompetition(id: string): Promise<Competition | null> {
  try {
    const client = await clientPromise
    const db = client.db()

    const competition = await db
      .collection("competitions")
      .findOne({ _id: new ObjectId(id) })

    if (!competition) {
      return null
    }

    const now = new Date()
    const endDate = new Date(competition.endDate)
    const startDate = new Date(competition.startDate)
    const registrationDeadline = new Date(competition.registrationDeadline)

    let status: Competition["status"] = "registration"

    // Update status based on dates
    if (now > endDate) {
      status = "completed"
    } else if (now >= startDate && now <= endDate) {
      status = "ongoing"
    } else if (now > registrationDeadline && now < startDate) {
      status = "upcoming"
    } else if (now <= registrationDeadline) {
      status = "registration"
    }

    // Update the competition status in the database if it has changed
    if (status !== competition.status) {
      await db
        .collection("competitions")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        )
    }

    return {
      _id: competition._id.toString(),
      title: competition.title,
      description: competition.description,
      type: competition.type,
      startDate: competition.startDate,
      endDate: competition.endDate,
      registrationDeadline: competition.registrationDeadline,
      maxTeams: competition.maxTeams,
      location: competition.location,
      organizerId: competition.organizerId,
      status,
      awards: competition.awards || [],
    }
  } catch (error) {
    console.error("Error fetching competition:", error)
    return null
  }
}

export default async function EditCompetitionPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return notFound()
  }

  const competition = await getCompetition(params.id)

  if (!competition) {
    return notFound()
  }

  // Check if user is the organizer or admin
  const userRole = (session.user as any).role
  if (competition.organizerId !== session.user.email && userRole !== "admin") {
    return notFound()
  }

  return <EditCompetitionForm competition={competition} />
} 