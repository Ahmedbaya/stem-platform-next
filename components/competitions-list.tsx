"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Trophy, Users } from "lucide-react"
import Link from "next/link"

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

interface CompetitionsListProps {
  competitions: Competition[]
  showParticipatingOnly?: boolean
}

export function CompetitionsList({ competitions, showParticipatingOnly }: CompetitionsListProps) {
  const getStatusBadgeVariant = (status: Competition["status"]) => {
    switch (status) {
      case "published":
        return "default"
      case "ongoing":
        return "default"
      case "completed":
        return "secondary"
      default:
        return "destructive"
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {competitions.map((competition) => (
        <Card key={competition._id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant={getStatusBadgeVariant(competition.status)} className="capitalize">
                {competition.status}
              </Badge>
              {competition.prizePool && (
                <Badge variant="outline" className="bg-primary/10">
                  <Trophy className="mr-1 h-3 w-3" />
                  {competition.prizePool}
                </Badge>
              )}
            </div>
            <CardTitle className="line-clamp-1">{competition.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {competition.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 grid gap-4">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{competition.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{competition.teams?.length || 0} / {competition.maxTeams} teams</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href={`/competitions/${competition._id}`}>
                {showParticipatingOnly ? "View Details" : "Join Competition"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 