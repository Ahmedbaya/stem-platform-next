import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    type: "evaluation_submitted",
    message: "You submitted an evaluation",
    details: "Team RoboTech Warriors - Technical Assessment",
    time: "30 minutes ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "RW",
    category: "Evaluation",
  },
  {
    id: 2,
    type: "feedback_provided",
    message: "You provided feedback",
    details: "Team Cyber Dynamics - Design Assessment",
    time: "2 hours ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "CD",
    category: "Feedback",
  },
  {
    id: 3,
    type: "assignment_received",
    message: "New judging assignment",
    details: "AI Robot Wars - Object Recognition Category",
    time: "Yesterday at 3:45 PM",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "AR",
    category: "Assignment",
  },
  {
    id: 4,
    type: "schedule_update",
    message: "Judging schedule updated",
    details: "International Robotics Challenge - Day 2",
    time: "Yesterday at 10:15 AM",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "IR",
    category: "Schedule",
  },
  {
    id: 5,
    type: "calibration_session",
    message: "Judges calibration session",
    details: "Autonomous Navigation Championship",
    time: "2 days ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "AN",
    category: "Meeting",
  },
]

export function JudgeRecentActivity() {
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
