"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Users, Trash2, Check, X, ChevronDown, ChevronUp, Mail } from "lucide-react"
import { toast } from "sonner"
import { ParticipantDetailsDialog } from "@/components/teams/participant-details-dialog"

interface TeamMember {
  _id: string
  name: string
  email: string
  role: string
}

interface Team {
  _id: string
  name: string
  description: string
  members: string[]
  memberNames: string[]
  leader: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

interface CompetitionTeams {
  competition: {
    _id: string
    title: string
  }
  teams: Team[]
}

interface TeamsListProps {
  teamsByCompetition: CompetitionTeams[]
}

export function TeamsList({ teamsByCompetition }: TeamsListProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [openTeams, setOpenTeams] = useState<Set<string>>(new Set())
  const [selectedParticipant, setSelectedParticipant] = useState<{
    name: string
    email: string
    isLeader: boolean
  } | null>(null)

  const toggleTeamMembers = (teamId: string) => {
    const newOpenTeams = new Set(openTeams)
    if (newOpenTeams.has(teamId)) {
      newOpenTeams.delete(teamId)
    } else {
      newOpenTeams.add(teamId)
    }
    setOpenTeams(newOpenTeams)
  }

  const handleTeamAction = async (competitionId: string, teamId: string, action: "approve" | "reject" | "delete") => {
    try {
      setIsLoading(`${action}-${teamId}`)
      
      if (action === "delete") {
        const response = await fetch(
          `/api/competitions/${competitionId}/teams/${teamId}`,
          {
            method: "DELETE",
          }
        )
        if (!response.ok) throw new Error("Failed to delete team")
        toast.success("Team deleted successfully")
      } else {
        const response = await fetch(
          `/api/competitions/${competitionId}/teams/${teamId}/approve`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action }),
          }
        )
        if (!response.ok) throw new Error(`Failed to ${action} team`)
        toast.success(`Team ${action}ed successfully`)
      }

      router.refresh()
    } catch (error) {
      toast.error(`Failed to ${action} team`)
      console.error(`Error ${action}ing team:`, error)
    } finally {
      setIsLoading(null)
    }
  }

  if (teamsByCompetition.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Teams</CardTitle>
          <CardDescription>
            There are no teams registered in your competitions yet.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getStatusBadgeVariant = (status: Team["status"]) => {
    switch (status) {
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="grid gap-8">
      <ParticipantDetailsDialog
        open={!!selectedParticipant}
        onOpenChange={(open) => !open && setSelectedParticipant(null)}
        participant={selectedParticipant}
      />
      {teamsByCompetition.map(({ competition, teams }) => (
        <div key={competition._id} className="grid gap-4">
          <h2 className="text-2xl font-semibold">{competition.title}</h2>
          {teams.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Card key={team._id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(team.status)}>
                        {team.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {team.description}
                    </p>
                    <Collapsible
                      open={openTeams.has(team._id)}
                      onOpenChange={() => toggleTeamMembers(team._id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{team.members.length} members</span>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {openTeams.has(team._id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="space-y-2">
                        {team.memberNames.map((memberName, index) => (
                          <div
                            key={`${team._id}-${index}`}
                            className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 rounded-md p-1 transition-colors"
                            onClick={() => setSelectedParticipant({
                              name: memberName,
                              email: team.members[index],
                              isLeader: team.members[index] === team.leader
                            })}
                          >
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {memberName}
                              {team.members[index] === team.leader && " (Leader)"}
                            </span>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                  <CardFooter className="mt-auto pt-6">
                    <div className="flex w-full justify-end gap-2">
                      {team.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            className="flex-1"
                            disabled={!!isLoading}
                            onClick={() => handleTeamAction(competition._id, team._id, "approve")}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            disabled={!!isLoading}
                            onClick={() => handleTeamAction(competition._id, team._id, "reject")}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {team.status === "approved" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              disabled={!!isLoading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Team
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Team</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this team? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleTeamAction(competition._id, team._id, "delete")}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Teams</CardTitle>
                <CardDescription>
                  No teams have registered for this competition yet.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      ))}
    </div>
  )
} 