import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Settings } from "lucide-react"

const competitions = [
  {
    id: 1,
    title: "International Robotics Challenge 2024",
    status: "active",
    teams: 32,
    date: "March 15-17, 2024",
  },
  {
    id: 2,
    title: "AI Robot Wars",
    status: "active",
    teams: 24,
    date: "April 5-7, 2024",
  },
  {
    id: 3,
    title: "Autonomous Navigation Championship",
    status: "draft",
    teams: 0,
    date: "May 20-22, 2024",
  },
]

export function CompetitionManagement() {
  return (
    <div className="space-y-4">
      {competitions.map((competition) => (
        <div key={competition.id} className="p-3 border rounded-lg space-y-3">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium">{competition.title}</p>
            <Badge variant={competition.status === "active" ? "default" : "secondary"} className="capitalize">
              {competition.status}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {competition.date}
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-3 w-3" />
              {competition.teams} teams
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button size="sm" asChild>
              <a href={`/competitions/${competition.id}`}>Manage</a>
            </Button>
          </div>
        </div>
      ))}
      <Button className="w-full" variant="outline">
        Create New Competition
      </Button>
    </div>
  )
}
