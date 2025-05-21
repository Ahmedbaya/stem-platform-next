'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Trash2, ChevronDown, ChevronUp, UserMinus } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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

interface Team {
  _id: string
  name: string
  description: string
  competitionId: string
  competitionTitle: string
  leader: string
  leaderName: string
  members: string[]
  memberNames: string[]
  status: "pending" | "approved" | "rejected"
  createdAt: Date
}

interface UserTeamsProps {
  userEmail: string
}

export function UserTeams({ userEmail }: UserTeamsProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams/user')
      if (!response.ok) throw new Error('Failed to fetch teams')
      const data = await response.json()
      setTeams(data.teams)
    } catch (error) {
      toast.error('Failed to load teams')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/delete`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Failed to delete team')
      
      toast.success('Team deleted successfully')
      setTeams(teams => teams.filter(t => t._id !== teamId))
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete team')
    }
  }

  const handleRemoveMember = async (teamId: string, memberEmail: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members/${encodeURIComponent(memberEmail)}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to remove member')
      
      toast.success('Member removed successfully')
      setTeams(teams => teams.map(team => {
        if (team._id === teamId) {
          return {
            ...team,
            members: team.members.filter(m => m !== memberEmail),
            memberNames: team.memberNames.filter((_, i) => team.members[i] !== memberEmail)
          }
        }
        return team
      }))
      router.refresh()
    } catch (error) {
      toast.error('Failed to remove member')
    }
  }

  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId)
  }

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-4">Loading teams...</p>
  }

  const leadingTeams = teams.filter(team => team.leader === userEmail)
  const memberTeams = teams.filter(team => team.leader !== userEmail)

  return (
    <div className="space-y-6">
      {leadingTeams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Teams I Lead</h2>
          {leadingTeams.map((team) => (
            <div key={team._id} className="flex flex-col bg-muted/40 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.competitionTitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {team.status}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => toggleTeamExpansion(team._id)}
                  >
                    {expandedTeam === team._id ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete Team</span>
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
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => handleDeleteTeam(team._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {expandedTeam === team._id && (
                <div className="px-4 pb-3 pt-1 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Team Members</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="h-5">Leader</Badge>
                        <span className="text-sm">{team.leaderName}</span>
                      </div>
                    </div>
                    {team.memberNames.map((memberName, index) => (
                      <div key={index} className="flex items-center justify-between pl-[52px]">
                        <span className="text-sm text-muted-foreground">{memberName}</span>
                        {team.members[index] !== team.leader && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <UserMinus className="h-3 w-3" />
                                <span className="sr-only">Remove Member</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this member from the team?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleRemoveMember(team._id, team.members[index])}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {memberTeams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Teams I'm In</h2>
          {memberTeams.map((team) => (
            <div key={team._id} className="flex flex-col bg-muted/40 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.competitionTitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {team.status}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => toggleTeamExpansion(team._id)}
                  >
                    {expandedTeam === team._id ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>
              {expandedTeam === team._id && (
                <div className="px-4 pb-3 pt-1 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Team Members</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="h-5">Leader</Badge>
                      <span className="text-sm">{team.leaderName}</span>
                    </div>
                    {team.memberNames.map((memberName, index) => (
                      <p key={index} className="text-sm text-muted-foreground pl-[52px]">
                        {memberName}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {teams.length === 0 && (
        <div className="text-center py-6">
          <p className="text-muted-foreground">You are not part of any teams yet.</p>
          <Button className="mt-4" asChild>
            <a href="/teams/create">Create a Team</a>
          </Button>
        </div>
      )}
    </div>
  )
} 