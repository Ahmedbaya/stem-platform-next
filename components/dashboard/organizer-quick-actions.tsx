import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Calendar, Users, Award } from "lucide-react"

const actions = [
  {
    title: "Create Competition",
    description: "Set up a new robotics event",
    icon: PlusCircle,
    href: "/competitions/create",
  },
  {
    title: "Schedule Events",
    description: "Manage competition timeline",
    icon: Calendar,
    href: "/organizer/schedule",
  },
  {
    title: "Manage Judges",
    description: "Assign judges to competitions",
    icon: Users,
    href: "/organizer/judges",
  },
  {
    title: "Award Management",
    description: "Create and assign awards",
    icon: Award,
    href: "/organizer/awards",
  },
]

export function OrganizerQuickActions() {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
      {actions.map((action) => (
        <Button
          key={action.title}
          variant="outline"
          className="h-auto flex-col items-start gap-2 p-3 sm:p-4 text-left w-full"
          asChild
        >
          <Link href={action.href}>
            <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            <div className="space-y-0.5">
              <div className="text-sm sm:text-base font-semibold">{action.title}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{action.description}</div>
            </div>
          </Link>
        </Button>
      ))}
    </div>
  )
}
