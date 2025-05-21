"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompetitionCard } from "@/components/competitions/competition-card"
import type { Competition } from "@/app/actions/competition-actions"

interface JudgeCompetitionsViewProps {
  competitions: Competition[]
  userId: string
}

export function JudgeCompetitionsView({ competitions, userId }: JudgeCompetitionsViewProps) {
  // Filter competitions
  const assignedCompetitions = competitions.filter((comp) => comp.judges?.includes(userId))
  const ongoingCompetitions = assignedCompetitions.filter((comp) => comp.status === "ongoing")
  const upcomingCompetitions = assignedCompetitions.filter((comp) => comp.status === "published")
  const completedCompetitions = assignedCompetitions.filter((comp) => comp.status === "completed")

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList>
          <TabsTrigger value="ongoing">Ongoing ({ongoingCompetitions.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingCompetitions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCompetitions.length})</TabsTrigger>
          <TabsTrigger value="all">All Assigned ({assignedCompetitions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ongoingCompetitions.map((competition) => (
              <CompetitionCard key={competition._id} competition={competition} role="judge" />
            ))}
            {ongoingCompetitions.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No ongoing competitions to judge at the moment
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingCompetitions.map((competition) => (
              <CompetitionCard key={competition._id} competition={competition} role="judge" />
            ))}
            {upcomingCompetitions.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No upcoming competitions assigned to you
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedCompetitions.map((competition) => (
              <CompetitionCard key={competition._id} competition={competition} role="judge" />
            ))}
            {completedCompetitions.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">No completed competitions</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignedCompetitions.map((competition) => (
              <CompetitionCard key={competition._id} competition={competition} role="judge" />
            ))}
            {assignedCompetitions.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                You haven&apos;t been assigned to any competitions yet
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
