"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Competition } from "@/app/actions/competition-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CompetitionForm } from "@/components/competitions/competition-form"
import { Calendar, MapPin, Trophy, Users, Clock, Edit, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface CompetitionDetailsProps {
  competition: Competition
  userRole: string
  userId?: string
}

export function CompetitionDetails({ competition, userRole, userId }: CompetitionDetailsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleStatusChange = async (status: Competition["status"]) => {
    // In a real app, this would call the updateCompetition function
    toast.success(`Competition status updated to ${status}`)
  }

  const handleRegister = async () => {
    if (!userId) {
      toast.error("You must be logged in to register")
      return
    }

    // In a real app, this would call the registerForCompetition function
    toast.success("Successfully registered for competition")
  }

  const isRegistered = userId && competition.teams?.includes(userId)
  const isOrganizer = userRole === "organizer" && competition.organizerId === userId
  const isAdmin = userRole === "admin"
  const canEdit = isAdmin || isOrganizer

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

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{competition.title}</h1>
              <Badge className="capitalize" variant={getStatusBadgeVariant(competition.status)}>
                {competition.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">Organized by {competition.organizerName}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/competitions">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Competitions
              </Link>
            </Button>

            {canEdit && (
              <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}

            {canEdit && competition.status === "draft" && (
              <Button onClick={() => handleStatusChange("published")}>Publish</Button>
            )}

            {canEdit && competition.status === "published" && (
              <Button onClick={() => handleStatusChange("ongoing")}>Start Competition</Button>
            )}

            {canEdit && competition.status === "ongoing" && (
              <Button onClick={() => handleStatusChange("completed")}>Complete</Button>
            )}

            {userRole === "participant" && competition.status === "published" && !isRegistered && (
              <Button onClick={handleRegister}>Register</Button>
            )}

            {userRole === "participant" && isRegistered && (
              <Badge variant="outline" className="px-3 py-1 text-sm">
                Registered
              </Badge>
            )}

            {userRole === "judge" && competition.status === "ongoing" && (
              <Button asChild>
                <Link href={`/competitions/${competition._id}/judge`}>Start Judging</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Left column - Image and details */}
          <div className="space-y-6 md:col-span-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={competition.image || "/placeholder.svg?height=400&width=600"}
                alt={competition.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Competition Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(competition.startDate).toLocaleDateString()} -{" "}
                        {new Date(competition.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{competition.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Registration Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(competition.registrationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Teams</p>
                      <p className="text-sm text-muted-foreground">
                        {competition.teams?.length || 0} / {competition.maxTeams} registered
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Prize Pool</p>
                      <p className="text-sm text-muted-foreground">{competition.prizePool}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {competition.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <p>{competition.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Tabs for teams, judges, etc. */}
          <div className="space-y-6">
            <Tabs defaultValue="teams">
              <TabsList className="w-full">
                <TabsTrigger value="teams">Teams</TabsTrigger>
                <TabsTrigger value="judges">Judges</TabsTrigger>
                {(competition.status === "ongoing" || competition.status === "completed") && (
                  <TabsTrigger value="results">Results</TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="teams" className="space-y-4 pt-4">
                {competition.teams && competition.teams.length > 0 ? (
                  <div className="space-y-2">
                    {/* In a real app, you would fetch team details */}
                    {competition.teams.map((teamId) => (
                      <Card key={teamId}>
                        <CardContent className="p-4">
                          <p className="font-medium">Team ID: {teamId}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No teams registered yet</p>
                )}
              </TabsContent>
              <TabsContent value="judges" className="space-y-4 pt-4">
                {competition.judges && competition.judges.length > 0 ? (
                  <div className="space-y-2">
                    {/* In a real app, you would fetch judge details */}
                    {competition.judges.map((judgeId) => (
                      <Card key={judgeId}>
                        <CardContent className="p-4">
                          <p className="font-medium">Judge ID: {judgeId}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No judges assigned yet</p>
                )}
              </TabsContent>
              {(competition.status === "ongoing" || competition.status === "completed") && (
                <TabsContent value="results" className="space-y-4 pt-4">
                  {/* In a real app, you would fetch results */}
                  <p className="text-center text-muted-foreground">
                    {competition.status === "ongoing"
                      ? "Results will be available when the competition is completed"
                      : "No results available yet"}
                  </p>
                </TabsContent>
              )}
            </Tabs>

            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                    Edit Competition
                  </Button>
                  {competition.status === "draft" && (
                    <Button className="w-full" onClick={() => handleStatusChange("published")}>
                      Publish Competition
                    </Button>
                  )}
                  {competition.status === "published" && (
                    <Button className="w-full" onClick={() => handleStatusChange("ongoing")}>
                      Start Competition
                    </Button>
                  )}
                  {competition.status === "ongoing" && (
                    <Button className="w-full" onClick={() => handleStatusChange("completed")}>
                      Complete Competition
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

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
