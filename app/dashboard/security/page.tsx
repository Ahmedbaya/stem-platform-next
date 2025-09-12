"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Shield, 
  UserCog, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Key,
  ShieldAlert,
  UserX,
  LogIn,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  _id: string
  name: string
  email: string
  role: string
  status?: string
  image?: string
}

interface ActivityLog {
  _id: string
  action: string
  userEmail: string
  userName: string
  timestamp: string
  details: string
  ipAddress: string
}

interface SecurityStats {
  pendingOrganizers: number
  activeOrganizers: number
  failedLogins: number
  activeSessions: number
  recentLogs: ActivityLog[]
}

export default function SecurityPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<SecurityStats>({
    pendingOrganizers: 0,
    activeOrganizers: 0,
    failedLogins: 0,
    activeSessions: 0,
    recentLogs: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("organizers")

  useEffect(() => {
    fetchSecurityData()
    // Refresh data every minute
    const interval = setInterval(fetchSecurityData, 60000)
    return () => clearInterval(interval)
  }, [])

  async function fetchSecurityData() {
    try {
      // Fetch users
      const usersResponse = await fetch("/api/users")
      if (!usersResponse.ok) throw new Error("Failed to fetch users")
      const usersData = await usersResponse.json()
      setUsers(usersData)

      // Fetch security stats
      const statsResponse = await fetch("/api/security/stats")
      if (!statsResponse.ok) throw new Error("Failed to fetch security stats")
      const statsData = await statsResponse.json()
      setStats(statsData)
    } catch (error) {
      toast.error("Failed to load security data")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApproval(userId: string, action: "approve" | "reject") {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "approved" : "rejected" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${action} user`)
      }

      // Refresh data after successful action
      await fetchSecurityData()
      toast.success(`User ${action}d successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${action} user`)
      console.error(error)
    }
  }

  const pendingOrganizers = users.filter(user => 
    user.role === "organizer" && user.status === "pending"
  )

  const approvedOrganizers = users.filter(user => 
    user.role === "organizer" && user.status === "approved"
  )

  const rejectedOrganizers = users.filter(user => 
    user.role === "organizer" && user.status === "rejected"
  )

  if (!session?.user || session.user.role !== "admin") {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrganizers}</div>
              <p className="text-xs text-muted-foreground">
                Organizers awaiting approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Organizers</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrganizers}</div>
              <p className="text-xs text-muted-foreground">
                Currently approved organizers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedLogins}</div>
              <p className="text-xs text-muted-foreground">
                In the last 24 hours
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <LogIn className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                Current active users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-4 gap-4 w-full">
            <TabsTrigger value="organizers" className="w-full">
              Organizer Management
            </TabsTrigger>
            <TabsTrigger value="activity" className="w-full">
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="roles" className="w-full">
              Role Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="w-full">
              Security Settings
            </TabsTrigger>
          </TabsList>

          {/* Existing Organizer Management Tab */}
          <TabsContent value="organizers">
            <Card>
              <CardHeader>
                <CardTitle>Organizer Access Management</CardTitle>
                <CardDescription>
                  Manage organizer access requests and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending" className="w-full">
                  <TabsList>
                    <TabsTrigger value="pending">
                      Pending ({pendingOrganizers.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                      Approved ({approvedOrganizers.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                      Rejected ({rejectedOrganizers.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="mt-6">
                    <div className="space-y-4">
                      {pendingOrganizers.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={user.image} />
                              <AvatarFallback>
                                {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproval(user._id, "approve")}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproval(user._id, "reject")}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingOrganizers.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No pending approval requests
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="approved" className="mt-6">
                    <div className="space-y-4">
                      {approvedOrganizers.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={user.image} />
                              <AvatarFallback>
                                {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproval(user._id, "reject")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Revoke Access
                          </Button>
                        </div>
                      ))}
                      {approvedOrganizers.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No approved organizers
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="rejected" className="mt-6">
                    <div className="space-y-4">
                      {rejectedOrganizers.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={user.image} />
                              <AvatarFallback>
                                {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproval(user._id, "approve")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Grant Access
                          </Button>
                        </div>
                      ))}
                      {rejectedOrganizers.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No rejected organizers
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Security Activity Log</CardTitle>
                <CardDescription>
                  Recent security events and user activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentLogs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={log.action.includes("failed") ? "destructive" : "default"}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.userName}</TableCell>
                        <TableCell>{log.details}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                      </TableRow>
                    ))}
                    {stats.recentLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No recent activity
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Configure role permissions and access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Admin Role</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Full system access and management capabilities
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge>User Management</Badge>
                      <Badge>Competition Management</Badge>
                      <Badge>Security Settings</Badge>
                      <Badge>System Configuration</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Organizer Role</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Competition management and team oversight
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="secondary">Create Competitions</Badge>
                      <Badge variant="secondary">Manage Teams</Badge>
                      <Badge variant="secondary">View Reports</Badge>
                      <Badge variant="secondary">Update Schedules</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure system-wide security parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Session Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Set session timeout and concurrent login limits
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Password Policy</h3>
                      <p className="text-sm text-muted-foreground">
                        Set password requirements and expiration
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">IP Whitelist</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage allowed IP addresses for admin access
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 