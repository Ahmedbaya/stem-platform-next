import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Calendar, Video, Bell } from "lucide-react"

const actions = [
  {
    title: "Follow Teams",
    description: "Add teams to your favorites",
    icon: Heart,
    href: "/spectator/teams",
  },
  {
    title: "Competition Schedule",
    description: "View upcoming events",
    icon: Calendar,
    href: "/competitions",
  },
  {
    title: "Live Streams",
    description: "Watch ongoing competitions",
    icon: Video,
    href: "/spectator/live",
  },
  {
    title: "Notification Settings",
    description: "Manage your alerts",
    icon: Bell,
    href: "/spectator/notifications",
  },
]

export function SpectatorQuickActions() {
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
