"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

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
  code?: string
  createdAt: Date
}

export function UserTeamsStatus() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      toast.error('Failed to load your teams')
    } finally {
      setIsLoading(false)
    }
  }

  const copyTeamCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Team code copied to clipboard')
  }

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-4">Loading your teams...</p>
  }

  if (teams.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        You haven't joined any teams yet
      </p>
    )
  }

  const getStatusColor = (status: Team["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <Card key={team._id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{team.name}</h3>
                <p className="text-sm text-muted-foreground">{team.competitionTitle}</p>
              </div>
              <Badge variant={team.status === "approved" ? "default" : team.status === "rejected" ? "destructive" : "secondary"}>
                {team.status}
              </Badge>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{team.memberNames.length} members</span>
              </div>
              {team.status === "approved" && team.code && (
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-muted rounded text-sm">{team.code}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyTeamCode(team.code!)}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy team code</span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 