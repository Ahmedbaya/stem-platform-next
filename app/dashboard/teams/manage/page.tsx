import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, XCircle, Users } from "lucide-react"

interface Team {
  _id: string
  name: string
  description: string
  competitionId: string
  competitionTitle: string
  leader: string
  leaderName: string
  members: string[]
  status: "pending" | "approved" | "rejected"
  createdAt: Date
}

async function getTeamsForOrganizer(organizerEmail: string) {
  const client = await clientPromise
  const db = client.db()

  // Get all competitions organized by this user
  const competitions = await db
    .collection("competitions")
    .find({ organizerId: organizerEmail })
    .toArray()

  const competitionIds = competitions.map((c) => c._id)
  const competitionTitles = new Map(competitions.map((c) => [c._id.toString(), c.title]))

  // Get all teams for these competitions
  const teams = await db
    .collection("teams")
    .find({ competitionId: { $in: competitionIds.map(id => id.toString()) } })
    .toArray()

  // Get all unique leader emails
  const leaderEmails = [...new Set(teams.map((t) => t.leader))]
  
  // Get leader names
  const users = await db
    .collection("users")
    .find({ email: { $in: leaderEmails } })
    .toArray()
  
  const userNames = new Map(users.map((u) => [u.email, u.name]))

  // Map competition titles and leader names to teams
  return teams.map((team) => ({
    ...team,
    _id: team._id.toString(),
    competitionTitle: competitionTitles.get(team.competitionId) || "Unknown Competition",
    leaderName: userNames.get(team.leader) || "Unknown User",
    name: team.name,
    description: team.description,
    competitionId: team.competitionId,
    leader: team.leader,
    members: team.members,
    status: team.status,
    createdAt: team.createdAt,
  })) as Team[]
}

export default async function ManageTeamsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/sign-in")
  }

  if ((session.user as any).role !== "organizer") {
    redirect("/dashboard")
  }

  const teams = await getTeamsForOrganizer(session.user.email)
  const pendingTeams = teams.filter((t) => t.status === "pending")
  const approvedTeams = teams.filter((t) => t.status === "approved")
  const rejectedTeams = teams.filter((t) => t.status === "rejected")

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Manage Team Registrations</h1>
      <p className="text-muted-foreground mb-6">
        Review and manage team registrations for your competitions
      </p>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingTeams.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingTeams.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingTeams.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending team registrations
            </p>
          ) : (
            <div className="grid gap-4">
              {pendingTeams.map((team) => (
                <TeamCard
                  key={team._id}
                  team={team}
                  showActions
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedTeams.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No approved teams yet
            </p>
          ) : (
            <div className="grid gap-4">
              {approvedTeams.map((team) => (
                <TeamCard
                  key={team._id}
                  team={team}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedTeams.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No rejected teams
            </p>
          ) : (
            <div className="grid gap-4">
              {rejectedTeams.map((team) => (
                <TeamCard
                  key={team._id}
                  team={team}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TeamCard({ team, showActions = false }: { team: Team; showActions?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription>{team.competitionTitle}</CardDescription>
          </div>
          <StatusBadge status={team.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{team.description}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Team Leader: {team.leaderName}</span>
            </div>
            <div>
              <Badge variant="outline">{team.members.length} members</Badge>
            </div>
          </div>

          {showActions && (
            <div className="flex gap-2 mt-4">
              <form action={`/api/teams/${team._id}/approve`} method="POST">
                <Button
                  type="submit"
                  variant="outline"
                  className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                >
                  Approve Team
                </Button>
              </form>
              <form action={`/api/teams/${team._id}/reject`} method="POST">
                <Button
                  type="submit"
                  variant="destructive"
                >
                  Reject Team
                </Button>
              </form>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: Team["status"] }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Pending
        </Badge>
      )
    case "approved":
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      )
  }
} 