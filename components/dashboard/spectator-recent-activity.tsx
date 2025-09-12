import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    type: "competition_watched",
    message: "Watched live competition",
    details: "International Robotics Challenge - Finals",
    time: "5 hours ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "IR",
    category: "Viewing",
  },
  {
    id: 2,
    type: "team_followed",
    message: "Started following team",
    details: "RoboTech Warriors",
    time: "Yesterday at 2:30 PM",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "RW",
    category: "Following",
  },
  {
    id: 3,
    type: "competition_reminder",
    message: "Competition reminder set",
    details: "AI Robot Wars - April 5, 10:00 AM",
    time: "2 days ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "AR",
    category: "Reminder",
  },
  {
    id: 4,
    type: "team_update",
    message: "Team update from favorite",
    details: "Cyber Dynamics qualified for semifinals",
    time: "3 days ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "CD",
    category: "Update",
  },
  {
    id: 5,
    type: "competition_result",
    message: "Competition results published",
    details: "Autonomous Navigation Championship",
    time: "5 days ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "AN",
    category: "Results",
  },
]

export function SpectatorRecentActivity() {
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
