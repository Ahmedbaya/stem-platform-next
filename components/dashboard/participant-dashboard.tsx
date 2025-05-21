"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParticipantOverview } from "@/components/dashboard/participant-overview"
import { ParticipantRecentActivity } from "@/components/dashboard/participant-recent-activity"
import { ParticipantQuickActions } from "@/components/dashboard/participant-quick-actions"
import { ParticipantStats } from "@/components/dashboard/participant-stats"
import { UpcomingCompetitions } from "@/components/dashboard/upcoming-competitions"
import { TeamPerformance } from "@/components/dashboard/team-performance"
import { UserTeamsStatus } from "@/components/dashboard/user-teams-status"

export default function ParticipantDashboard() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Participant Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track your competitions and team performance</p>
      </div>

      {/* Participant Stats */}
      <ParticipantStats />

      <div className="grid gap-4 sm:gap-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* My Teams */}
          <Card>
            <CardHeader>
              <CardTitle>My Teams</CardTitle>
              <CardDescription>Your teams and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <UserTeamsStatus />
            </CardContent>
          </Card>

          {/* Upcoming Competitions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Competitions</CardTitle>
              <CardDescription>Your registered events</CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingCompetitions />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Performance Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Your scores and rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <ParticipantOverview />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <ParticipantRecentActivity />
            </CardContent>
          </Card>
        </div>

        {/* Participant Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common participant tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ParticipantQuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
