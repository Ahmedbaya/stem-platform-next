"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JudgeOverview } from "@/components/dashboard/judge-overview"
import { JudgeRecentActivity } from "@/components/dashboard/judge-recent-activity"
import { JudgeQuickActions } from "@/components/dashboard/judge-quick-actions"
import { JudgeStats } from "@/components/dashboard/judge-stats"
import { AssignedCompetitions } from "@/components/dashboard/assigned-competitions"
import { PendingEvaluations } from "@/components/dashboard/pending-evaluations"

export default function JudgeDashboard() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Judge Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Evaluate competitions and manage scoring</p>
      </div>

      {/* Judge Stats */}
      <JudgeStats />

      <div className="grid gap-4 sm:gap-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Assigned Competitions */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Competitions</CardTitle>
              <CardDescription>Events you're judging</CardDescription>
            </CardHeader>
            <CardContent>
              <AssignedCompetitions />
            </CardContent>
          </Card>

          {/* Pending Evaluations */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Evaluations</CardTitle>
              <CardDescription>Teams awaiting your assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <PendingEvaluations />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Judging Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Judging Analytics</CardTitle>
              <CardDescription>Your evaluation patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <JudgeOverview />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest evaluations and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <JudgeRecentActivity />
            </CardContent>
          </Card>
        </div>

        {/* Judge Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common judging tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <JudgeQuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
