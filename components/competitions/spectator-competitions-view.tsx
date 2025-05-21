"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompetitionCard } from "@/components/competitions/competition-card"
import type { Competition } from "@/app/actions/competition-actions"

interface SpectatorCompetitionsViewProps {
  competitions: Competition[]
}

export function SpectatorCompetitionsView({ competitions }: SpectatorCompetitionsViewProps) {
  // Filter competitions by status
  const ongoingCompetitions = competitions.filter((comp) => comp.status === "ongoing")
  const upcomingCompetitions = competitions.filter((comp) => comp.status === "published")
  const completedCompetitions = competitions.filter((comp) => comp.status === "completed")

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList>
          <TabsTrigger value="ongoing">Live Now ({ongoingCompetitions.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingCompetitions.length})</TabsTrigger>
          <TabsTrigger value="completed">Past Events ({completedCompetitions.length})</TabsTrigger>
          <TabsTrigger value="all">All ({competitions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ongoingCompetitions.map((competition) => (
              <CompetitionCard key={competition._id} competition={competition} role="spectator" />
            ))}
            {ongoingCompetitions.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No competitions are currently live
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingCompetitions.map((competition) => (
              <CompetitionCard key={competition._id} competition={competition} role="spectator" />
            ))}
            {upcomingCompetitions.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No upcoming competitions at the moment
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedCompetitions.map((competition) => (
              <CompetitionCard key={competition._id} competition={competition} role="spectator" />
            ))}
            {completedCompetitions.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">No past competitions</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition) => (
              <CompetitionCard key={competition._id} competition={competition} role="spectator" />
            ))}
            {competitions.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">No competitions found</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
