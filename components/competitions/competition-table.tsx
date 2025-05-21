"use client"

import { useState } from "react"
import Link from "next/link"
import { type Competition, updateCompetition } from "@/app/actions/competition-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CompetitionForm } from "@/components/competitions/competition-form"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"

interface CompetitionTableProps {
  competitions: Competition[]
  role: "admin" | "organizer" | "participant" | "judge" | "spectator"
  onDelete?: (id: string) => void
  onRegister?: (id: string) => void
  registeredTeamId?: string
}

export function CompetitionTable({
  competitions,
  role,
  onDelete,
  onRegister,
  registeredTeamId,
}: CompetitionTableProps) {
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null)

  const handleStatusChange = async (competition: Competition, status: Competition["status"]) => {
    const result = await updateCompetition(competition._id!, { status })
    if (result.success) {
      toast.success(`Competition status updated to ${status}`)
    } else {
      toast.error(`Failed to update status: ${result.error}`)
    }
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
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const isRegistered = (competition: Competition) => {
    return registeredTeamId && competition.teams?.includes(registeredTeamId)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competition</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitions.map((competition) => (
              <TableRow key={competition._id}>
                <TableCell className="font-medium">{competition.title}</TableCell>
                <TableCell>
                  {new Date(competition.startDate).toLocaleDateString()} -{" "}
                  {new Date(competition.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{competition.location}</TableCell>
                <TableCell>
                  <Badge className="capitalize" variant={getStatusBadgeVariant(competition.status)}>
                    {competition.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {(role === "admin" || role === "organizer") && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/competitions/${competition._id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingCompetition(competition)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {onDelete && (
                          <DropdownMenuItem onClick={() => onDelete(competition._id!)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {competition.status === "draft" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(competition, "published")}>
                            Publish
                          </DropdownMenuItem>
                        )}
                        {competition.status === "published" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(competition, "ongoing")}>
                            Start Competition
                          </DropdownMenuItem>
                        )}
                        {competition.status === "ongoing" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(competition, "completed")}>
                            Complete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {role === "participant" && (
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/competitions/${competition._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      {competition.status === "published" && !isRegistered(competition) && onRegister && (
                        <Button variant="outline" size="sm" onClick={() => onRegister(competition._id!)}>
                          Register
                        </Button>
                      )}
                      {isRegistered(competition) && <Badge variant="outline">Registered</Badge>}
                    </div>
                  )}

                  {role === "judge" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/competitions/${competition._id}/judge`}>
                        {competition.status === "ongoing" ? "Judge Now" : "View Details"}
                      </Link>
                    </Button>
                  )}

                  {role === "spectator" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/competitions/${competition._id}`}>
                        {competition.status === "ongoing" ? "Watch Live" : "View Details"}
                      </Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingCompetition} onOpenChange={(open) => !open && setEditingCompetition(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Competition</DialogTitle>
          </DialogHeader>
          {editingCompetition && (
            <CompetitionForm competition={editingCompetition} onSuccess={() => setEditingCompetition(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
