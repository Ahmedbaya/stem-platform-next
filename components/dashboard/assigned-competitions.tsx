import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

const competitions = [
  {
    id: 1,
    title: "International Robotics Challenge 2024",
    status: "active",
    date: "March 15-17, 2024",
    location: "San Francisco, CA",
    category: "Autonomous Navigation",
  },
  {
    id: 2,
    title: "AI Robot Wars",
    status: "upcoming",
    date: "April 5-7, 2024",
    location: "Boston, MA",
    category: "Object Recognition",
  },
  {
    id: 3,
    title: "Autonomous Navigation Championship",
    status: "upcoming",
    date: "May 20-22, 2024",
    location: "Tokyo, Japan",
    category: "Path Planning",
  },
]

export function AssignedCompetitions() {
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
              <MapPin className="mr-1 h-3 w-3" />
              {competition.location}
            </div>
          </div>
          <p className="text-xs">Category: {competition.category}</p>
          <Button size="sm" className="w-full" asChild>
            <a href={`/judge/competitions/${competition.id}`}>
              {competition.status === "active" ? "Judge Now" : "View Details"}
            </a>
          </Button>
        </div>
      ))}
    </div>
  )
}
