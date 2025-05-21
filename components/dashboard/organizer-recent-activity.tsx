import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    type: "team_registration",
    message: "New team registered",
    details: "Team Quantum Robotics for International Robotics Challenge",
    time: "15 minutes ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "QR",
    category: "Registration",
  },
  {
    id: 2,
    type: "judge_assigned",
    message: "Judge assigned to competition",
    details: "Dr. Sarah Johnson - AI Robot Wars",
    time: "1 hour ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "SJ",
    category: "Staffing",
  },
  {
    id: 3,
    type: "schedule_updated",
    message: "Competition schedule updated",
    details: "International Robotics Challenge - Finals moved to 4:00 PM",
    time: "3 hours ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "IR",
    category: "Schedule",
  },
  {
    id: 4,
    type: "payment_received",
    message: "Registration payment received",
    details: "Team AI Innovators - $250.00",
    time: "Yesterday at 2:30 PM",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "AI",
    category: "Payment",
  },
  {
    id: 5,
    type: "venue_confirmed",
    message: "Venue booking confirmed",
    details: "Tech Convention Center - Autonomous Navigation Championship",
    time: "2 days ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "TC",
    category: "Logistics",
  },
]

export function OrganizerRecentActivity() {
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
              <Badge variant="outline" className="text-xs">
                {activity.category}
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
