import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserCheck, UserX, Mail } from "lucide-react"
import { approveTeam, rejectTeam } from "@/app/actions/team-actions"
import { toast } from "sonner"
import { TeamActions } from "@/components/competitions/team-actions"

interface Team {
  _id: string | ObjectId
  name: string
  description: string
  leader: string
  members: string[]
  status: "pending" | "approved" | "rejected"
  code?: string
  createdAt: Date
  competitionId: string | ObjectId
}

interface TeamWithNames extends Omit<Team, '_id' | 'competitionId' | 'createdAt'> {
  _id: string
  competitionId: string
  createdAt: Date
  leaderName: string
  memberNames: string[]
}

async function getTeams(competitionId: string): Promise<TeamWithNames[]> {
  try {
    const client = await clientPromise
    const db = client.db()

    // Get all teams for this competition
    const teams = await db
      .collection("teams")
      .find({ competitionId: new ObjectId(competitionId) })
      .sort({ createdAt: -1 })
      .toArray()

    const teamsData = teams.map(team => ({
      _id: team._id,
      name: team.name as string,
      description: team.description as string,
      leader: team.leader as string,
      members: team.members as string[],
      status: team.status as "pending" | "approved" | "rejected",
      code: team.code as string | undefined,
      createdAt: team.createdAt as Date,
      competitionId: team.competitionId,
    })) as Team[]

    // Get all unique member emails
    const memberEmails = Array.from(new Set(teamsData.flatMap(t => [t.leader, ...t.members])))

    // Get user details for all members
    const users = await db
      .collection("users")
      .find({ email: { $in: memberEmails } })
      .toArray()

    // Create a map of email to name
    const userNames = new Map(users.map(u => [u.email as string, u.name as string]))

    return teamsData.map(team => ({
      ...team,
      _id: team._id.toString(),
      competitionId: team.competitionId.toString(),
      leaderName: userNames.get(team.leader) || "Unknown User",
      memberNames: team.members.map((email: string) => userNames.get(email) || "Unknown User")
    }))
  } catch (error) {
    console.error("Error fetching teams:", error)
    return []
  }
}

export default async function TeamsManagementPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return notFound()
  }

  const teams = await getTeams(params.id)
  const pendingTeams = teams.filter(t => t.status === "pending")
  const approvedTeams = teams.filter(t => t.status === "approved")
  const rejectedTeams = teams.filter(t => t.status === "rejected")

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Teams Management</h1>
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

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending Teams
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved Teams
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-6">
            {pendingTeams.map(team => (
              <Card key={team._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>{team.description}</CardDescription>
                    </div>
                    <TeamActions
                      teamId={team._id}
                      onApprove={approveTeam}
                      onReject={rejectTeam}
                    />
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
                No pending teams to review
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
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>{team.description}</CardDescription>
                    </div>
                    <Badge variant="default">Approved</Badge>
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
                No approved teams yet
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
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>{team.description}</CardDescription>
                    </div>
                    <Badge variant="destructive">Rejected</Badge>
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
                No rejected teams
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 