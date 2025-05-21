"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  AlertTriangle,
  Database,
  Server,
  Settings,
  HardDrive,
  CircleOff,
  Cpu,
  Network,
  RefreshCw,
  Loader2,
  Shield,
  Users,
  Lock
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

interface SystemStats {
  database: {
    status: string
    connections: number
    collections: number
    totalDocuments: number
    storageSize: string
  }
  server: {
    uptime: string
    nodeVersion: string
    platform: string
    memory: {
      total: string
      used: string
      free: string
    }
    cpu: {
      cores: number
      load: number
    }
  }
}

interface Role {
  name: string
  displayName: string
  description: string
  permissions: string[]
  isSystem: boolean
}

export default function SystemPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [refreshing, setRefreshing] = useState(false)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  useEffect(() => {
    fetchSystemStats()
    fetchRoles()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchSystemStats, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchSystemStats() {
    try {
      setRefreshing(true)
      const response = await fetch("/api/system/stats")
      if (!response.ok) throw new Error("Failed to fetch system stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast.error("Failed to load system statistics")
      console.error(error)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  async function fetchRoles() {
    try {
      const response = await fetch("/api/roles")
      if (!response.ok) throw new Error("Failed to fetch roles")
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      toast.error("Failed to load roles")
      console.error(error)
    }
  }

  async function handlePermissionToggle(roleName: string, permission: string, currentPermissions: string[]) {
    try {
      setUpdatingRole(roleName)
      const newPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission]

      const response = await fetch("/api/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleName,
          permissions: newPermissions
        })
      })

      if (!response.ok) throw new Error("Failed to update role permissions")
      
      // Update local state
      setRoles(roles.map(role => 
        role.name === roleName 
          ? { ...role, permissions: newPermissions }
          : role
      ))

      toast.success("Role permissions updated")
    } catch (error) {
      toast.error("Failed to update role permissions")
      console.error(error)
    } finally {
      setUpdatingRole(null)
    }
  }

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">System Dashboard</h1>
        <Button
          variant="outline"
          onClick={fetchSystemStats}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Status</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant={stats?.database.status === "connected" ? "default" : "destructive"}>
                  {stats?.database.status || "Unknown"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.database.connections} active connections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.server.uptime}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.server.platform} - Node {stats?.server.nodeVersion}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <CircleOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.server.memory.used}</div>
              <p className="text-xs text-muted-foreground">
                of {stats?.server.memory.total} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Load</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.server.cpu.load}%</div>
              <p className="text-xs text-muted-foreground">
                {stats?.server.cpu.cores} CPU cores
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>
                  Detailed system information and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Server Information</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Platform</TableCell>
                          <TableCell>{stats?.server.platform}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Node Version</TableCell>
                          <TableCell>{stats?.server.nodeVersion}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Uptime</TableCell>
                          <TableCell>{stats?.server.uptime}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">CPU Cores</TableCell>
                          <TableCell>{stats?.server.cpu.cores}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Memory Usage</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Total Memory</TableCell>
                          <TableCell>{stats?.server.memory.total}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Used Memory</TableCell>
                          <TableCell>{stats?.server.memory.used}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Free Memory</TableCell>
                          <TableCell>{stats?.server.memory.free}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
                <CardDescription>
                  MongoDB database statistics and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Status</TableCell>
                        <TableCell>
                          <Badge variant={stats?.database.status === "connected" ? "default" : "destructive"}>
                            {stats?.database.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Active Connections</TableCell>
                        <TableCell>{stats?.database.connections}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Collections</TableCell>
                        <TableCell>{stats?.database.collections}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Total Documents</TableCell>
                        <TableCell>{stats?.database.totalDocuments}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Storage Size</TableCell>
                        <TableCell>{stats?.database.storageSize}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Configure role permissions and access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {roles.map((role) => (
                    <div key={role.name} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{role.displayName}</h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                        {role.isSystem && (
                          <Badge variant="secondary">System Role</Badge>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {role.name === "admin" && (
                          <>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">User Management</div>
                                  <div className="text-xs text-muted-foreground">Manage user accounts and permissions</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("user_management")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "user_management", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Competition Management</div>
                                  <div className="text-xs text-muted-foreground">Full control over competitions</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("competition_management")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "competition_management", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Security Settings</div>
                                  <div className="text-xs text-muted-foreground">Manage security configurations</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("security_settings")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "security_settings", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Settings className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">System Configuration</div>
                                  <div className="text-xs text-muted-foreground">Configure system settings</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("system_configuration")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "system_configuration", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                          </>
                        )}

                        {role.name === "organizer" && (
                          <>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Create Competitions</div>
                                  <div className="text-xs text-muted-foreground">Create and manage competitions</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("create_competitions")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "create_competitions", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Manage Teams</div>
                                  <div className="text-xs text-muted-foreground">Oversee team registrations</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("manage_teams")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "manage_teams", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <HardDrive className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">View Reports</div>
                                  <div className="text-xs text-muted-foreground">Access competition reports</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("view_reports")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "view_reports", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Settings className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Update Schedules</div>
                                  <div className="text-xs text-muted-foreground">Modify competition schedules</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("update_schedules")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "update_schedules", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                          </>
                        )}

                        {role.name === "participant" && (
                          <>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Join Competitions</div>
                                  <div className="text-xs text-muted-foreground">Register and participate in competitions</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("join_competitions")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "join_competitions", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <HardDrive className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">View Schedules</div>
                                  <div className="text-xs text-muted-foreground">Access competition schedules</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("view_schedules")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "view_schedules", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Settings className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Submit Entries</div>
                                  <div className="text-xs text-muted-foreground">Submit competition entries</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("submit_entries")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "submit_entries", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                          </>
                        )}

                        {role.name === "judge" && (
                          <>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Evaluate Entries</div>
                                  <div className="text-xs text-muted-foreground">Review and score competition entries</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("evaluate_entries")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "evaluate_entries", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <HardDrive className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">View Submissions</div>
                                  <div className="text-xs text-muted-foreground">Access participant submissions</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("view_submissions")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "view_submissions", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Settings className="w-4 h-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Provide Feedback</div>
                                  <div className="text-xs text-muted-foreground">Give feedback on submissions</div>
                                </div>
                              </div>
                              <Switch
                                checked={role.permissions.includes("provide_feedback")}
                                onCheckedChange={() => handlePermissionToggle(role.name, "provide_feedback", role.permissions)}
                                disabled={role.isSystem || updatingRole === role.name}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Database Backup</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure automated backup schedule
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Log Rotation</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage system logs and rotation policy
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Performance Tuning</h3>
                      <p className="text-sm text-muted-foreground">
                        Adjust system performance parameters
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Maintenance Mode</h3>
                      <p className="text-sm text-muted-foreground">
                        Enable/disable system maintenance mode
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