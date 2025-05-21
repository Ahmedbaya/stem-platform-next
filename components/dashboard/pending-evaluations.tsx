import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

const evaluations = [
  {
    id: 1,
    team: {
      name: "RoboTech Warriors",
      image: "/placeholder.svg?height=32&width=32",
      initials: "RW",
    },
    competition: "International Robotics Challenge 2024",
    category: "Autonomous Navigation",
    deadline: "Today, 5:00 PM",
    priority: "high",
  },
  {
    id: 2,
    team: {
      name: "Cyber Dynamics",
      image: "/placeholder.svg?height=32&width=32",
      initials: "CD",
    },
    competition: "International Robotics Challenge 2024",
    category: "Autonomous Navigation",
    deadline: "Tomorrow, 12:00 PM",
    priority: "medium",
  },
  {
    id: 3,
    team: {
      name: "AI Innovators",
      image: "/placeholder.svg?height=32&width=32",
      initials: "AI",
    },
    competition: "International Robotics Challenge 2024",
    category: "Autonomous Navigation",
    deadline: "Mar 17, 3:00 PM",
    priority: "low",
  },
]

export function PendingEvaluations() {
  return (
    <div className="space-y-4">
      {evaluations.map((evaluation) => (
        <div key={evaluation.id} className="p-3 border rounded-lg space-y-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={evaluation.team.image} alt={evaluation.team.name} />
              <AvatarFallback>{evaluation.team.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{evaluation.team.name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{evaluation.competition}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {evaluation.deadline}
            </div>
            <Badge
              variant={
                evaluation.priority === "high"
                  ? "destructive"
                  : evaluation.priority === "medium"
                    ? "default"
                    : "secondary"
              }
              className="capitalize"
            >
              {evaluation.priority}
            </Badge>
          </div>
          <Button size="sm" className="w-full">
            Evaluate
          </Button>
        </div>
      ))}
      {evaluations.length === 0 && <div className="text-center py-6 text-muted-foreground">No pending evaluations</div>}
    </div>
  )
}
