"use client"

import { useState } from "react"
import Link from "next/link"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Calendar, MapPin, Users, Trophy, MoreVertical, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"

interface Team {
  _id: string
  name: string
  status: "pending" | "approved" | "rejected"
}

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
  teams: string[] // This is just an array of team IDs
  teamDetails?: Team[] // This will hold the actual team objects
}

interface OrganizerCompetitionCardProps {
  competition: Competition & { teamDetails?: Team[] }
}

export function OrganizerCompetitionCard({ competition }: OrganizerCompetitionCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const statusColors = {
    draft: "bg-gray-500",
    published: "bg-green-500",
    ongoing: "bg-blue-500",
    completed: "bg-purple-500",
  }

  const pendingTeams = competition.teamDetails?.filter(t => t.status === "pending") ?? []
  const approvedTeams = competition.teamDetails?.filter(t => t.status === "approved") ?? []
  const totalTeams = competition.teamDetails?.length ?? 0

  async function onDelete() {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/competitions/${competition._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete competition")
      }

      toast.success("Competition deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Delete error:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to delete competition")
      }
    } finally {
      setIsDeleting(false)
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
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="capitalize">
              {competition.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/competitions/${competition._id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Competition
                  </Link>
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Competition
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        competition and all associated team data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            <span>{totalTeams} / {competition.maxTeams} teams</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Teams</h4>
            <Link href={`/dashboard/competitions/${competition._id}/teams`}>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {pendingTeams.length} Pending
            </Badge>
            <Badge variant="default">
              {approvedTeams.length} Approved
            </Badge>
          </div>
          {pendingTeams.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Pending Teams:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {pendingTeams.slice(0, 3).map(team => (
                  <li key={team._id}>{team.name}</li>
                ))}
                {pendingTeams.length > 3 && (
                  <li>+{pendingTeams.length - 3} more...</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/competitions/${competition._id}/teams`}>
            Manage Teams
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 