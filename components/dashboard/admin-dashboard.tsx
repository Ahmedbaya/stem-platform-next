"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { AdminRecentActivity } from "@/components/dashboard/admin-recent-activity"
import { AdminQuickActions } from "@/components/dashboard/admin-quick-actions"
import { AdminStats } from "@/components/dashboard/admin-stats"
import { UserManagement } from "@/components/dashboard/user-management"
import { CompetitionApprovals } from "@/components/dashboard/competition-approvals"
import { SystemStatus } from "@/components/dashboard/system-status"

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage the platform, users, and competitions</p>
      </div>

      {/* Admin Stats */}
      <AdminStats />

      <div className="grid gap-4 sm:gap-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Platform Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>User activity and growth metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Overview />
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Server and service health</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemStatus />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>

          {/* Competition Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Approvals</CardTitle>
              <CardDescription>Pending competition requests</CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitionApprovals />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Admin Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Administrative Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminQuickActions />
            </CardContent>
          </Card>

          {/* Admin Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Recent platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminRecentActivity />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
