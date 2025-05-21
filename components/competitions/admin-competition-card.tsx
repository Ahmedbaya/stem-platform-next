"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import { toast } from "sonner"

interface Competition {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  location: string
  maxTeams: number
  status: "draft" | "published" | "ongoing" | "completed"
  organizerId: string
  organizerName?: string
}

interface AdminCompetitionCardProps {
  competition: Competition
}

export function AdminCompetitionCard({ competition }: AdminCompetitionCardProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const statusColors = {
    draft: "bg-gray-500",
    published: "bg-green-500",
    ongoing: "bg-blue-500",
    completed: "bg-purple-500",
  }

  async function handleApproval(action: "approve" | "reject") {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/competitions/${competition._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action === "approve" ? "published" : "draft",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${action} competition`)
      }

      toast.success(`Competition ${action}d successfully`)
      router.refresh()
    } catch (error) {
      console.error(`${action} error:`, error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(`Failed to ${action} competition`)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{competition.title}</CardTitle>
            <CardDescription>{competition.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize">
            {competition.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Registration Deadline: {new Date(competition.registrationDeadline).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Competition: {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{competition.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Max Teams: {competition.maxTeams}</span>
          </div>
          {competition.organizerName && (
            <div className="text-muted-foreground">
              Organizer: {competition.organizerName}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {competition.status === "draft" && (
          <>
            <Button
              variant="outline"
              onClick={() => handleApproval("reject")}
              disabled={isUpdating}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleApproval("approve")}
              disabled={isUpdating}
            >
              Approve
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
} 