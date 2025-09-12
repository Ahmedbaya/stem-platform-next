import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Users, MapPin, Clock } from "lucide-react"

const liveCompetitions = [
  {
    id: 1,
    title: "International Robotics Challenge 2024",
    viewers: 1245,
    location: "San Francisco, CA",
    category: "Autonomous Navigation",
    status: "live",
  },
  {
    id: 2,
    title: "AI Robot Wars - Semifinals",
    viewers: 876,
    location: "Boston, MA",
    category: "Object Recognition",
    status: "live",
  },
  {
    id: 3,
    title: "Junior Robotics League",
    viewers: 432,
    location: "Chicago, IL",
    category: "Line Following",
    status: "upcoming",
    startsIn: "15 minutes",
  },
]

export function LiveCompetitions() {
  return (
    <div className="space-y-4">
      {liveCompetitions.map((competition) => (
        <div key={competition.id} className="p-3 border rounded-lg space-y-3">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium">{competition.title}</p>
            <Badge variant={competition.status === "live" ? "destructive" : "secondary"} className="capitalize">
              {competition.status === "live" ? "LIVE" : competition.status}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-1 h-3 w-3" />
              {competition.location}
            </div>
            {competition.status === "live" && (
              <div className="flex items-center">
                <Users className="mr-1 h-3 w-3" />
                {competition.viewers} watching
              </div>
            )}
            {competition.status === "upcoming" && (
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                Starts in {competition.startsIn}
              </div>
            )}
          </div>
          <Button size="sm" className="w-full" asChild>
            <a href={`/spectator/live/${competition.id}`}>
              {competition.status === "live" ? (
                <>
                  <Video className="mr-2 h-4 w-4" /> Watch Now
                </>
              ) : (
                "Set Reminder"
              )}
            </a>
          </Button>
        </div>
      ))}
    </div>
  )
}
