"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

interface User {
  _id: string
  name: string
  email: string
  role: string
  status?: string
  image?: string
}

export function UsersManagement() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      toast.error("Failed to load users")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: string, userEmail: string) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update user role")
      }
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ))
      
      toast.success("User role updated successfully")

      if (session?.user?.email === userEmail) {
        toast.info("Your role has been changed. You will be signed out.")
        setTimeout(() => {
          signOut({ callbackUrl: "/login" })
        }, 2000)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user role")
      console.error(error)
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

      setUsers(users.map(user =>
        user._id === userId ? { ...user, status: action === "approve" ? "approved" : "rejected" } : user
      ))

      toast.success(`User ${action}d successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${action} user`)
      console.error(error)
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value) => handleRoleChange(user._id, value, user.email)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                      <SelectItem value="judge">Judge</SelectItem>
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="spectator">Spectator</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {user.role === "organizer" && (
                    <>
                      {user.status === "pending" ? (
                        <Badge variant="secondary">Pending Approval</Badge>
                      ) : user.status === "rejected" ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500">Approved</Badge>
                      )}
                    </>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === "organizer" && (
                      <>
                        {user.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApproval(user._id, "approve")}
                              className="h-8 w-8"
                              title="Approve Organizer"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApproval(user._id, "reject")}
                              className="h-8 w-8"
                              title="Reject Organizer"
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        {user.status === "approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApproval(user._id, "reject")}
                            className="h-8 w-8"
                            title="Revoke Organizer Access"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        {user.status === "rejected" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApproval(user._id, "approve")}
                            className="h-8 w-8"
                            title="Grant Organizer Access"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              // Handle delete
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 