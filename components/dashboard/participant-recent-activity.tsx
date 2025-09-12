import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    type: "competition_registration",
    message: "Registered for competition",
    details: "International Robotics Challenge 2024",
    time: "2 hours ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "IR",
    category: "Registration",
  },
  {
    id: 2,
    type: "feedback_received",
    message: "Feedback received from judge",
    details: "Technical Assessment - Score: 85/100",
    time: "Yesterday at 4:15 PM",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "TA",
    category: "Feedback",
  },
  {
    id: 3,
    type: "team_update",
    message: "New team member joined",
    details: "Alex Chen joined RoboTech Warriors",
    time: "2 days ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "AC",
    category: "Team",
  },
  {
    id: 4,
    type: "submission_uploaded",
    message: "Project documentation submitted",
    details: "AI Robot Wars - Technical Documentation",
    time: "3 days ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "AR",
    category: "Submission",
  },
  {
    id: 5,
    type: "schedule_notification",
    message: "Competition schedule updated",
    details: "Your presentation time: March 16, 2:30 PM",
    time: "4 days ago",
    icon: "/placeholder.svg?height=32&width=32",
    iconFallback: "CS",
    category: "Schedule",
  },
]

export function ParticipantRecentActivity() {
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
