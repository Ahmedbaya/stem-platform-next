import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

const pendingCompetitions = [
  {
    id: 1,
    title: "Regional Robotics Challenge",
    organizer: "Tech University",
    date: "April 10-12, 2024",
    status: "pending",
  },
  {
    id: 2,
    title: "AI Navigation Competition",
    organizer: "Robotics Association",
    date: "May 5-7, 2024",
    status: "pending",
  },
  {
    id: 3,
    title: "Junior Robotics League",
    organizer: "STEM Education Center",
    date: "June 15-17, 2024",
    status: "pending",
  },
]

export function CompetitionApprovals() {
  return (
    <div className="space-y-4">
      {pendingCompetitions.map((competition) => (
        <div key={competition.id} className="p-3 border rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">{competition.title}</p>
              <p className="text-xs text-muted-foreground">By {competition.organizer}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {competition.status}
            </Badge>
          </div>
          <p className="text-xs">{competition.date}</p>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Reject</span>
            </Button>
            <Button size="sm" className="h-8 w-8 p-0">
              <Check className="h-4 w-4" />
              <span className="sr-only">Approve</span>
            </Button>
          </div>
        </div>
      ))}
      {pendingCompetitions.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">No pending approvals</div>
      )}
    </div>
  )
}
