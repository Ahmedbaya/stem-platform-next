"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SpectatorOverview } from "@/components/dashboard/spectator-overview"
import { SpectatorRecentActivity } from "@/components/dashboard/spectator-recent-activity"
import { SpectatorQuickActions } from "@/components/dashboard/spectator-quick-actions"
import { SpectatorStats } from "@/components/dashboard/spectator-stats"
import { LiveCompetitions } from "@/components/dashboard/live-competitions"
import { FavoriteTeams } from "@/components/dashboard/favorite-teams"

export default function SpectatorDashboard() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Spectator Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Follow competitions and track your favorite teams</p>
      </div>

      {/* Spectator Stats */}
      <SpectatorStats />

      <div className="grid gap-4 sm:gap-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Live Competitions */}
          <Card>
            <CardHeader>
              <CardTitle>Live Competitions</CardTitle>
              <CardDescription>Currently active events</CardDescription>
            </CardHeader>
            <CardContent>
              <LiveCompetitions />
            </CardContent>
          </Card>

          {/* Favorite Teams */}
          <Card>
            <CardHeader>
              <CardTitle>Favorite Teams</CardTitle>
              <CardDescription>Teams you're following</CardDescription>
            </CardHeader>
            <CardContent>
              <FavoriteTeams />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Competition Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Calendar</CardTitle>
              <CardDescription>Upcoming events schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <SpectatorOverview />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from followed competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <SpectatorRecentActivity />
            </CardContent>
          </Card>
        </div>

        {/* Spectator Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common spectator tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <SpectatorQuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
