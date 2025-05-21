"use client"

import { useEffect, useState } from "react"
import { useSocket } from "@/components/socket-provider"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  type: "team-registration" | "team-approved"
  teamId: string
  teamName: string
  competitionId: string
  timestamp: string
}

export function NotificationCenter() {
  const { socket, isConnected } = useSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!socket || !isConnected) return

    // Listen for new team registrations
    socket.on("new-team-registration", (data: Omit<Notification, "id" | "type">) => {
      const notification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        type: "team-registration",
        ...data
      }
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    // Listen for team approval updates
    socket.on("team-status-updated", (data: Omit<Notification, "id" | "type">) => {
      const notification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        type: "team-approved",
        ...data
      }
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      socket.off("new-team-registration")
      socket.off("team-status-updated")
    }
  }, [socket, isConnected])

  const markAsRead = () => {
    setUnreadCount(0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" onCloseAutoFocus={markAsRead}>
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-muted-foreground">
            No notifications
          </DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1">
              <div className="font-medium">
                {notification.type === "team-registration" 
                  ? `New team registration: ${notification.teamName}`
                  : `Team approved: ${notification.teamName}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(notification.timestamp).toLocaleString()}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 