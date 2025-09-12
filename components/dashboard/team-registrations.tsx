'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Trash2, ChevronDown, ChevronUp, Users } from "lucide-react"
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

export function TeamRegistrations() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams/pending')
      if (!response.ok) throw new Error('Failed to fetch teams')
      const data = await response.json()
      setTeams(data.teams)
    } catch (error) {
      toast.error('Failed to load team registrations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (teamId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      const response = await fetch(`/api/teams/${teamId}/${action}`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error(`Failed to ${action} team`)
      
      toast.success(`Team ${action}d successfully`)
      // Remove the team from the list
      setTeams(teams => teams.filter(t => t._id !== teamId))
      router.refresh()
    } catch (error) {
      toast.error(`Failed to ${action} team`)
    }
  }

  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId)
  }

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-4">Loading...</p>
  }

  return (
    <div className="space-y-4">
      {teams.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No pending team registrations</p>
      ) : (
        teams.map((team) => (
          <div key={team._id} className="flex flex-col bg-muted/40 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{team.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 w-7 p-0"
                  onClick={() => handleAction(team._id, 'reject')}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Reject</span>
                </Button>
                <Button 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => handleAction(team._id, 'approve')}
                >
                  <Check className="h-3 w-3" />
                  <span className="sr-only">Approve</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Delete</span>
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
                        onClick={() => handleAction(team._id, 'delete')}
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
                <div className="space-y-1">
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
        ))
      )}
      <Button size="sm" variant="outline" className="w-full" asChild>
        <a href="/dashboard/teams/manage">View All Registrations</a>
      </Button>
    </div>
  )
}

// Re-export for dynamic import
export { TeamRegistrations as default }
