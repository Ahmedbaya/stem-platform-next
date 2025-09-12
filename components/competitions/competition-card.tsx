"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Competition } from "@/app/actions/competition-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CompetitionForm } from "@/components/competitions/competition-form"
import { Calendar, MapPin, Trophy, Users, Edit, Trash2, Eye, Medal } from "lucide-react"
import { toast } from "sonner"
import { UpdateStatusButton } from "./update-status-button"

interface CompetitionCardProps {
  competition: Competition
  role: "admin" | "organizer" | "participant" | "judge" | "spectator"
  onDelete?: () => void
  onRegister?: () => void
  isRegistered?: boolean
}

export function CompetitionCard({
  competition,
  role,
  onDelete,
  onRegister,
  isRegistered = false,
}: CompetitionCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleStatusChange = async (status: Competition["status"]) => {
    // In a real app, this would call the updateCompetition function
    toast.success(`Competition status updated to ${status}`)
  }

  const getStatusBadgeVariant = (status: Competition["status"]) => {
    switch (status) {
      case "draft":
        return "secondary"
      case "published":
        return "outline"
      case "ongoing":
        return "default"
      case "completed":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Update the getCompetitionLink function to ensure it works with both dashboard and public routes
  const getCompetitionLink = () => {
    // Make sure we're using the correct path format
    const baseUrl = `/competitions/${competition._id}`

    if (role === "judge" && competition.status === "ongoing") {
      return `${baseUrl}/judge`
    }

    return baseUrl
  }

  const statusColors = {
    draft: "bg-gray-500",
    published: "bg-blue-500",
    ongoing: "bg-green-500",
    completed: "bg-purple-500"
  }

  const canEdit = role === "admin" || role === "organizer"

  return (
    <>
      <Card className="overflow-hidden">
        <Link href={getCompetitionLink()}>
          <div className="relative h-48 w-full">
            <Image
              src={competition.image || "/placeholder.svg?height=400&width=600"}
              alt={competition.title}
              fill
              className="object-cover"
            />
            <Badge className="absolute right-2 top-2 capitalize" variant={getStatusBadgeVariant(competition.status)}>
              {competition.status}
            </Badge>
          </div>
        </Link>
        <CardHeader>
          <Link href={getCompetitionLink()}>
            <CardTitle className="line-clamp-2 hover:underline">{competition.title}</CardTitle>
          </Link>
          <CardDescription>{competition.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(competition.startDate).toLocaleDateString()} -{" "}
                {new Date(competition.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{competition.location}</span>
            </div>
            {(competition.teams?.length !== undefined || competition.maxTeams) && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {competition.teams?.length || 0} / {competition.maxTeams} teams
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span>Prize pool: {competition.prizePool}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {canEdit && (
            <>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              {onDelete && (
                <Button variant="outline" size="sm" className="flex-1" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <div className="w-full">
                <UpdateStatusButton
                  competitionId={competition._id}
                  currentStatus={competition.status}
                />
              </div>
            </>
          )}

          {role === "participant" && (
            <>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={getCompetitionLink()}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
              {competition.status === "published" && !isRegistered && onRegister && (
                <Button variant="default" size="sm" className="flex-1" onClick={onRegister}>
                  Register
                </Button>
              )}
              {isRegistered && (
                <Badge variant="outline" className="ml-auto">
                  Registered
                </Badge>
              )}
            </>
          )}

          {role === "judge" && (
            <Button variant="default" size="sm" className="w-full" asChild>
              <Link href={getCompetitionLink()}>{competition.status === "ongoing" ? "Judge Now" : "View Details"}</Link>
            </Button>
          )}

          {role === "spectator" && (
            <Button variant="default" size="sm" className="w-full" asChild>
              <Link href={getCompetitionLink()}>
                {competition.status === "ongoing" ? "Watch Live" : "View Details"}
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Competition</DialogTitle>
          </DialogHeader>
          <CompetitionForm competition={competition} onSuccess={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
