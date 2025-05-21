"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CompetitionCard } from "@/components/competitions/competition-card"
import { CompetitionForm } from "@/components/competitions/competition-form"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import type { Competition } from "@/app/actions/competition-actions"

interface AdminCompetitionsViewProps {
  competitions: Competition[]
}

export function AdminCompetitionsView({ competitions }: AdminCompetitionsViewProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Filter competitions by status
  const draftCompetitions = competitions.filter((comp) => comp.status === "draft")
  const publishedCompetitions = competitions.filter((comp) => comp.status === "published")
  const ongoingCompetitions = competitions.filter((comp) => comp.status === "ongoing")
  const completedCompetitions = competitions.filter((comp) => comp.status === "completed")

  const handleDelete = (competitionId: string) => {
    // In a real app, this would call the deleteCompetition function
    toast.success(`Competition deleted successfully`)
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All ({competitions.length})</TabsTrigger>
                <TabsTrigger value="draft">Drafts ({draftCompetitions.length})</TabsTrigger>
                <TabsTrigger value="published">Published ({publishedCompetitions.length})</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing ({ongoingCompetitions.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedCompetitions.length})</TabsTrigger>
              </TabsList>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Competition
              </Button>
            </div>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {competitions.map((competition) => (
                  <CompetitionCard
                    key={competition._id}
                    competition={competition}
                    role="admin"
                    onDelete={() => handleDelete(competition._id!)}
                  />
                ))}
                {competitions.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">No competitions found</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="draft" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {draftCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition._id}
                    competition={competition}
                    role="admin"
                    onDelete={() => handleDelete(competition._id!)}
                  />
                ))}
                {draftCompetitions.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">No draft competitions</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="published" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publishedCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition._id}
                    competition={competition}
                    role="admin"
                    onDelete={() => handleDelete(competition._id!)}
                  />
                ))}
                {publishedCompetitions.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">No published competitions</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ongoing" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ongoingCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition._id}
                    competition={competition}
                    role="admin"
                    onDelete={() => handleDelete(competition._id!)}
                  />
                ))}
                {ongoingCompetitions.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">No ongoing competitions</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition._id}
                    competition={competition}
                    role="admin"
                    onDelete={() => handleDelete(competition._id!)}
                  />
                ))}
                {completedCompetitions.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">No completed competitions</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Competition</DialogTitle>
          </DialogHeader>
          <CompetitionForm
            onSuccess={() => {
              setIsCreateDialogOpen(false)
              toast.success("Competition created successfully")
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
