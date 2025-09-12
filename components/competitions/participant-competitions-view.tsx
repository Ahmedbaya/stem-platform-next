"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompetitionCard } from "@/components/competitions/competition-card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import type { Competition } from "@/app/actions/competition-actions"

interface DashboardCompetitionsPageProps {
  competitions: Competition[]
  isOrganizer?: boolean
  onDelete?: (id: string) => Promise<void>
}

export function ParticipantCompetitionsView({ 
  competitions, 
  isOrganizer = false,
  onDelete 
}: DashboardCompetitionsPageProps) {
  const [applying, setApplying] = useState<Record<string, boolean>>({})

  // Filter competitions by status - only show published and ongoing for participants
  const publishedCompetitions = competitions.filter((comp) => comp.status === "published")
  const ongoingCompetitions = competitions.filter((comp) => comp.status === "ongoing")
  const completedCompetitions = competitions.filter((comp) => comp.status === "completed")

  const handleApply = async (competitionId: string) => {
    try {
      setApplying((prev) => ({ ...prev, [competitionId]: true }))
      
      // Replace this with your actual API call
      await fetch('/api/competitions/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ competitionId }),
      })

      toast.success("Successfully applied to competition!")
    } catch (error) {
      toast.error("Failed to apply to competition. Please try again.")
    } finally {
      setApplying((prev) => ({ ...prev, [competitionId]: false }))
    }
  }

  const renderCompetitionCard = (competition: Competition) => (
    <div key={competition._id} className="relative group">
      <CompetitionCard
        competition={competition}
        role={isOrganizer ? "admin" : "participant"}
      />
      {isOrganizer && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/dashboard/competitions/${competition._id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(competition._id!)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
      {competition.status === "published" && (
        <div className="mt-4">
          <Button 
            className="w-full"
            onClick={() => handleApply(competition._id!)}
            disabled={applying[competition._id!]}
          >
            {applying[competition._id!] ? "Applying..." : "Apply Now"}
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Competitions</h1>
      
      <div className="flex flex-col gap-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({competitions.length})</TabsTrigger>
            <TabsTrigger value="published">Open ({publishedCompetitions.length})</TabsTrigger>
            <TabsTrigger value="ongoing">In Progress ({ongoingCompetitions.length})</TabsTrigger>
            <TabsTrigger value="completed">Past ({completedCompetitions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {competitions.map(renderCompetitionCard)}
              {competitions.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No competitions available at the moment
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="published" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publishedCompetitions.map(renderCompetitionCard)}
              {publishedCompetitions.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No competitions open for registration
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ongoing" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ongoingCompetitions.map(renderCompetitionCard)}
              {ongoingCompetitions.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No competitions currently in progress
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedCompetitions.map(renderCompetitionCard)}
              {completedCompetitions.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No past competitions
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}