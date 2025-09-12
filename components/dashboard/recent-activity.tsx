import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    user: {
      name: "John Doe",
      image: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
    action: "registered for",
    target: "International Robotics Challenge 2024",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Alice Smith",
      image: "/placeholder.svg?height=32&width=32",
      initials: "AS",
    },
    action: "submitted scores for",
    target: "Autonomous Navigation Round",
    time: "4 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Team RoboTech",
      image: "/placeholder.svg?height=32&width=32",
      initials: "RT",
    },
    action: "won first place in",
    target: "AI Robot Wars",
    time: "1 day ago",
  },
  {
    id: 4,
    user: {
      name: "Sarah Johnson",
      image: "/placeholder.svg?height=32&width=32",
      initials: "SJ",
    },
    action: "created a new team",
    target: "Quantum Robotics",
    time: "2 days ago",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start sm:items-center">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            <AvatarImage src={activity.user.image} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-3 sm:ml-4 space-y-0.5 sm:space-y-1">
            <p className="text-xs sm:text-sm font-medium leading-none">
              <span className="font-semibold">{activity.user.name}</span> {activity.action}{" "}
              <span className="font-semibold">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

