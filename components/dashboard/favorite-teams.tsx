import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

const teams = [
  {
    id: 1,
    name: "RoboTech Warriors",
    image: "/placeholder.svg?height=32&width=32",
    initials: "RW",
    nextCompetition: "International Robotics Challenge 2024",
    nextCompetitionDate: "March 15-17, 2024",
    status: "competing",
  },
  {
    id: 2,
    name: "Cyber Dynamics",
    image: "/placeholder.svg?height=32&width=32",
    initials: "CD",
    nextCompetition: "AI Robot Wars",
    nextCompetitionDate: "April 5-7, 2024",
    status: "registered",
  },
  {
    id: 3,
    name: "AI Innovators",
    image: "/placeholder.svg?height=32&width=32",
    initials: "AI",
    nextCompetition: "Autonomous Navigation Championship",
    nextCompetitionDate: "May 20-22, 2024",
    status: "registered",
  },
]

export function FavoriteTeams() {
  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <div key={team.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={team.image} alt={team.name} />
              <AvatarFallback>{team.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{team.name}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {team.nextCompetitionDate}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={team.status === "competing" ? "default" : "secondary"} className="capitalize">
              {team.status}
            </Badge>
            <Button size="sm" variant="ghost" className="h-7" asChild>
              <a href={`/teams/${team.id}`}>View</a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
