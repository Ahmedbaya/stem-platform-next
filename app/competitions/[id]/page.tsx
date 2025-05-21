import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Award, CalendarDays, MapPin, Trophy, Users } from "lucide-react"
import { CompetitionActions } from "../../../components/competitions/competition-actions"
import { TeamRegistrationDialog } from "@/components/competitions/team-registration-dialog"

interface Competition {
  _id: string
  title: string
  description: string
  type: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxTeams: number
  location: string
  status: string
  image?: string
  teams?: { 
    _id: string
    name: string
    description: string
    members: string[]
    leader: string
    status: "pending" | "approved" | "rejected"
    code?: string
  }[]
  organizerId: string
  awards: {
    title: string
    description: string
    value: string
  }[]
  evaluationCriteria?: {
    name: string
    description: string
    weight: number
    maxScore: number
  }[]
}

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

    // Get teams for this competition
    const teams = await db
      .collection("teams")
      .find({ competitionId: new ObjectId(id) })
      .toArray()

    const formattedCompetition: Competition = {
      ...competition,
      _id: competition._id.toString(),
      title: competition.title,
      description: competition.description,
      type: competition.type,
      startDate: competition.startDate,
      endDate: competition.endDate,
      registrationDeadline: competition.registrationDeadline,
      maxTeams: competition.maxTeams,
      location: competition.location,
      status: competition.status,
      organizerId: competition.organizerId,
      awards: competition.awards || [],
      evaluationCriteria: competition.evaluationCriteria || [],
      teams: teams.map(team => ({
        _id: team._id.toString(),
        name: team.name,
        description: team.description,
        members: team.members,
        leader: team.leader,
        status: team.status,
        code: team.code,
      })),
    }

    return formattedCompetition
  } catch (error) {
    console.error("Error fetching competition:", error)
    return null
  }
}

export default async function CompetitionPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const competition = await getCompetition(params.id)

  if (!competition) {
    notFound()
  }

  const isOrganizer = session?.user?.email === competition.organizerId || 
    (session?.user as any)?.role === "admin"

  const userEmail = session?.user?.email
  const userTeam = userEmail
    ? competition.teams?.find(team => team.members.includes(userEmail))
    : null

  const startDate = new Date(competition.startDate)
  const endDate = new Date(competition.endDate)
  const registrationDeadline = new Date(competition.registrationDeadline)

  return (
    <div>
      {/* Cover Photo Section */}
      <div className="relative h-[300px] w-full">
        <Image
          src={competition.image || '/placeholder.svg?height=300&width=1200'}
          alt={competition.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="container py-8">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {competition.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{competition.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{competition.teams?.length || 0} / {competition.maxTeams} Teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>{competition.type}</span>
                </div>
              </div>
            </div>
            {isOrganizer && <CompetitionActions competition={competition} />}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{competition.description}</p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Important Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-sm text-muted-foreground">
                        {startDate.toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">
                        {endDate.toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Registration Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {registrationDeadline.toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Awards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {competition.awards.length > 0 ? (
                    competition.awards.map((award, index) => (
                      <div key={index} className="space-y-2">
                        <h3 className="font-semibold">{award.title}</h3>
                        <p className="text-sm text-muted-foreground">{award.description}</p>
                        <p className="text-sm font-medium">Value: {award.value}</p>
                        {index < competition.awards.length - 1 && (
                          <hr className="my-4" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No awards specified for this competition.</p>
                  )}
                </CardContent>
              </Card>

              {/* Evaluation Criteria Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Evaluation Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {competition.evaluationCriteria && competition.evaluationCriteria.length > 0 ? (
                    <ul className="space-y-4">
                      {competition.evaluationCriteria.map((criteria, idx) => (
                        <li key={idx} className="border-b pb-2 last:border-b-0 last:pb-0">
                          <div className="font-semibold">{criteria.name}</div>
                          <div className="text-sm text-muted-foreground mb-1">{criteria.description}</div>
                          <div className="text-xs text-muted-foreground flex gap-4">
                            <span>Weight: <span className="font-medium">{criteria.weight}%</span></span>
                            <span>Max Score: <span className="font-medium">{criteria.maxScore}</span></span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No evaluation criteria specified for this competition.</p>
                  )}
                </CardContent>
              </Card>

              {!isOrganizer && session?.user?.email && (
                <Card>
                  <CardHeader>
                    <CardTitle>Registration</CardTitle>
                    <CardDescription>
                      {userTeam ? (
                        userTeam.status === "pending" 
                          ? "Your team registration is pending approval"
                          : userTeam.status === "approved"
                          ? "You are registered with " + userTeam.name
                          : "Your team registration was rejected"
                      ) : (
                        "Join this competition with your team"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userTeam ? (
                      <>
                        {userTeam.status === "pending" && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Your team registration is being reviewed by the organizer. 
                              You will be notified once it's approved.
                            </p>
                            <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
                              <p className="text-sm font-medium">Team Name:</p>
                              <p className="text-sm">{userTeam.name}</p>
                            </div>
                          </div>
                        )}
                        {userTeam.status === "approved" && (
                          <div className="space-y-2">
                            {userTeam.leader === session.user.email ? (
                              <>
                                <p className="text-sm font-medium">Team Code</p>
                                <p className="font-mono bg-muted p-2 rounded-md text-center">
                                  {userTeam.code}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Share this code with your team members to let them join
                                </p>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
                                <p className="text-sm font-medium">Team Name:</p>
                                <p className="text-sm">{userTeam.name}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {userTeam.status === "rejected" && (
                          <>
                            <p className="text-sm text-muted-foreground mb-4">
                              Your team registration was not approved. You can create a new team or join an existing one.
                            </p>
                            <TeamRegistrationDialog 
                              competitionId={competition._id}
                              userEmail={session.user.email}
                            />
                          </>
                        )}
                      </>
                    ) : (
                      <TeamRegistrationDialog 
                        competitionId={competition._id}
                        userEmail={session.user.email}
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
