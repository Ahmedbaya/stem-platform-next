"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrganizerOverview } from "@/components/dashboard/organizer-overview"
import { OrganizerRecentActivity } from "@/components/dashboard/organizer-recent-activity"
import { OrganizerQuickActions } from "@/components/dashboard/organizer-quick-actions"
import { OrganizerStats } from "@/components/dashboard/organizer-stats"
import { CompetitionManagement } from "@/components/dashboard/competition-management"
import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import TeamRegistrations with no SSR
const TeamRegistrations = dynamic(
  () => import("./team-registrations").then((mod) => mod.TeamRegistrations),
  { ssr: false }
)

export default function OrganizerDashboard() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Organizer Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your competitions and events</p>
      </div>

      {/* Organizer Stats */}
      <OrganizerStats />

      <div className="grid gap-4 sm:gap-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Competition Management */}
          <Card>
            <CardHeader>
              <CardTitle>Your Competitions</CardTitle>
              <CardDescription>Manage your active competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitionManagement />
            </CardContent>
          </Card>

          {/* Team Registrations */}
          <Card>
            <CardHeader>
              <CardTitle>Team Registrations</CardTitle>
              <CardDescription>Recent team sign-ups</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading team registrations...</div>}>
                <TeamRegistrations />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Competition Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Analytics</CardTitle>
              <CardDescription>Participation and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizerOverview />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizerRecentActivity />
            </CardContent>
          </Card>
        </div>

        {/* Organizer Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common organizer tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizerQuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
