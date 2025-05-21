import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin } from "lucide-react"

const competitions = [
  {
    id: 1,
    title: "International Robotics Challenge 2024",
    date: "March 15-17, 2024",
    location: "San Francisco, CA",
    image: "/placeholder.svg?height=32&width=32",
    initials: "IRC",
  },
  {
    id: 2,
    title: "AI Robot Wars",
    date: "April 5-7, 2024",
    location: "Boston, MA",
    image: "/placeholder.svg?height=32&width=32",
    initials: "ARW",
  },
  {
    id: 3,
    title: "Autonomous Navigation Championship",
    date: "May 20-22, 2024",
    location: "Tokyo, Japan",
    image: "/placeholder.svg?height=32&width=32",
    initials: "ANC",
  },
]

export function UpcomingCompetitions() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {competitions.map((competition) => (
        <div key={competition.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
              <AvatarImage src={competition.image} alt={competition.title} />
              <AvatarFallback>{competition.initials}</AvatarFallback>
            </Avatar>
            <div className="ml-3 sm:ml-4 space-y-0.5 sm:space-y-1">
              <p className="text-sm font-medium leading-none">{competition.title}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {competition.date}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  {competition.location}
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto w-full sm:w-auto" asChild>
            <a href={`/competitions/${competition.id}`}>View</a>
          </Button>
        </div>
      ))}
    </div>
  )
}

