import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Mail, Trophy, ArrowRight } from "lucide-react"
import { TeamActions } from "@/components/competitions/team-actions"
import { approveTeam, rejectTeam } from "@/app/actions/team-actions"

interface Competition {
  _id: string
  title: string
}

interface Team {
  _id: string
  name: string
  description: string
  leader: string
  members: string[]
  status: "pending" | "approved" | "rejected"
  code?: string
  createdAt: Date
  competitionId: string
  competition: Competition
  leaderName: string
  memberNames: string[]
}

interface ExtendedSession {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

async function getParticipantTeams(userEmail: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Get all teams where the user is a member or leader
    const teams = await db
      .collection("teams")
      .find({
        $or: [
          { members: userEmail },
          { leader: userEmail }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Get competition IDs from teams
    const competitionIds = Array.from(new Set(teams.map(t => t.competitionId)))

    // Get competition details
    const competitions = await db
      .collection("competitions")
      .find({
        _id: { 
          $in: competitionIds.map(id => {
            try {
              return typeof id === 'string' ? new ObjectId(id) : id
            } catch {
              return id
            }
          })
        }
      })
      .toArray()

    const competitionsMap = new Map(competitions.map(c => [c._id.toString(), { _id: c._id.toString(), title: c.title }]))

    // Get all unique member emails
    const memberEmails = Array.from(new Set(teams.flatMap(t => [t.leader, ...t.members])))

    // Get user details for all members
    const users = await db
      .collection("users")
      .find({ email: { $in: memberEmails } })
      .toArray()

    // Create a map of email to name
    const userNames = new Map(users.map(u => [u.email as string, u.name as string]))

    return teams.map(team => ({
      ...team,
      _id: team._id.toString(),
      competitionId: team.competitionId.toString(),
      competition: competitionsMap.get(team.competitionId.toString())!,
      leaderName: userNames.get(team.leader) || "Unknown User",
      memberNames: team.members.map((email: string) => userNames.get(email) || "Unknown User")
    })) as Team[]
  } catch (error) {
    console.error("Error fetching teams:", error)
    return []
  }
}

async function getOrganizerTeams(organizerEmail: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    // First get all competitions organized by this user
    const competitions = await db
      .collection("competitions")
      .find({ 
        $or: [
          { organizerId: organizerEmail },
          { "organizers": organizerEmail }
        ]
      })
      .toArray()

    const competitionIds = competitions.map(c => c._id)
    const competitionsMap = new Map(competitions.map(c => [c._id.toString(), { _id: c._id.toString(), title: c.title }]))

    // Get all teams for these competitions
    const teams = await db
      .collection("teams")
      .find({ 
        competitionId: { 
          $in: competitionIds.map(id => new ObjectId(id.toString())) 
        } 
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Get all unique member emails
    const memberEmails = Array.from(new Set(teams.flatMap(t => [t.leader, ...t.members])))

    // Get user details for all members
    const users = await db
      .collection("users")
      .find({ email: { $in: memberEmails } })
      .toArray()

    // Create a map of email to name
    const userNames = new Map(users.map(u => [u.email as string, u.name as string]))

    return teams.map(team => ({
      ...team,
      _id: team._id.toString(),
      competitionId: team.competitionId.toString(),
      competition: competitionsMap.get(team.competitionId.toString())!,
      leaderName: userNames.get(team.leader) || "Unknown User",
      memberNames: team.members.map((email: string) => userNames.get(email) || "Unknown User")
    })) as Team[]
  } catch (error) {
    console.error("Error fetching teams:", error)
    return []
  }
}

export default async function TeamsPage() {
  const session = await getServerSession(authOptions) as ExtendedSession
  
  if (!session?.user?.email) {
    return notFound()
  }

  const userRole = session.user?.role || 'participant'

  // Get teams based on user role
  const teams = userRole === 'organizer' 
    ? await getOrganizerTeams(session.user.email)
    : await getParticipantTeams(session.user.email)

  const pendingTeams = teams.filter(t => t.status === "pending")
  const approvedTeams = teams.filter(t => t.status === "approved")
  const rejectedTeams = teams.filter(t => t.status === "rejected")

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {userRole === 'organizer' ? 'Teams Management' : 'My Teams'}
        </h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {teams.length} Total Teams
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {pendingTeams.length} Pending
          </Badge>
          <Badge variant="default" className="text-sm">
            {approvedTeams.length} Approved
          </Badge>
          <Badge variant="destructive" className="text-sm">
            {rejectedTeams.length} Rejected
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {userRole === 'organizer' ? (
            <>
              <TabsTrigger value="pending">Pending Teams</TabsTrigger>
              <TabsTrigger value="approved">Approved Teams</TabsTrigger>
              <TabsTrigger value="rejected">Rejected Teams</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="approved">Active Teams</TabsTrigger>
              <TabsTrigger value="pending">Pending Teams</TabsTrigger>
              <TabsTrigger value="rejected">Rejected Teams</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-6">
            {pendingTeams.map(team => (
              <Card key={team._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <Link 
                          href={`/dashboard/competitions/${team.competitionId}/teams`}
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          {team.competition.title}
                        </Link>
                      </div>
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>{team.description}</CardDescription>
                    </div>
                    {userRole === 'organizer' && (
                      <TeamActions
                        teamId={team._id}
                        onApprove={approveTeam}
                        onReject={rejectTeam}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {team.members.length} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Leader: {team.leaderName} ({team.leader})
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <p className="text-sm font-medium">Team Members:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {team.memberNames.map((name, i) => (
                          <li key={i}>{name} ({team.members[i]})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingTeams.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {userRole === 'organizer' 
                  ? 'No pending teams to review'
                  : 'No pending team registrations'}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="grid gap-6">
            {approvedTeams.map(team => (
              <Card key={team._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <Link 
                          href={`/dashboard/competitions/${team.competitionId}/teams`}
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          {team.competition.title}
                        </Link>
                      </div>
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>{team.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/competitions/${team.competitionId}/teams`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {team.members.length} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Leader: {team.leaderName} ({team.leader})
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <p className="text-sm font-medium">Team Members:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {team.memberNames.map((name, i) => (
                          <li key={i}>{name} ({team.members[i]})</li>
                        ))}
                      </ul>
                    </div>
                    {team.code && (
                      <div className="mt-4">
                        <p className="text-sm font-medium">Team Code:</p>
                        <code className="text-sm bg-muted rounded px-2 py-1">
                          {team.code}
                        </code>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {approvedTeams.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {userRole === 'organizer' 
                  ? 'No approved teams yet'
                  : 'You have no active teams'}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <div className="grid gap-6">
            {rejectedTeams.map(team => (
              <Card key={team._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <Link 
                          href={`/dashboard/competitions/${team.competitionId}/teams`}
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          {team.competition.title}
                        </Link>
                      </div>
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>{team.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/competitions/${team.competitionId}/teams`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {team.members.length} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Leader: {team.leaderName} ({team.leader})
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <p className="text-sm font-medium">Team Members:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {team.memberNames.map((name, i) => (
                          <li key={i}>{name} ({team.members[i]})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {rejectedTeams.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {userRole === 'organizer' 
                  ? 'No rejected teams'
                  : 'No rejected team registrations'}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 