import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    type: "user_registration",
    message: "New user registered",
    details: "Emma Wilson (emma@example.com)",
    time: "10 minutes ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "EW",
    severity: "info",
  },
  {
    id: 2,
    type: "competition_created",
    message: "New competition created",
    details: "AI Robot Wars by Tech University",
    time: "45 minutes ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "TU",
    severity: "info",
  },
  {
    id: 3,
    type: "payment_failed",
    message: "Payment processing failed",
    details: "Registration fee for International Robotics Challenge",
    time: "2 hours ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "PF",
    severity: "warning",
  },
  {
    id: 4,
    type: "system_update",
    message: "System update completed",
    details: "Platform version 2.4.0 deployed successfully",
    time: "5 hours ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "SU",
    severity: "success",
  },
  {
    id: 5,
    type: "security_alert",
    message: "Multiple failed login attempts",
    details: "IP: 192.168.1.1 - User: admin@example.com",
    time: "Yesterday at 11:32 PM",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "SA",
    severity: "error",
  },
]

export function AdminRecentActivity() {
  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            <AvatarImage src={activity.icon} alt="" />
            <AvatarFallback>{activity.iconFallback}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{activity.message}</p>
              <Badge
                variant={
                  activity.severity === "error"
                    ? "destructive"
                    : activity.severity === "warning"
                      ? "outline"
                      : activity.severity === "success"
                        ? "default"
                        : "secondary"
                }
                className="text-xs"
              >
                {activity.severity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{activity.details}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
