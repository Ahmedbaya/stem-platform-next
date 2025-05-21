import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Users, ClipboardList, MessageSquare } from "lucide-react"

const actions = [
  {
    title: "Create Competition",
    description: "Set up a new robotics competition",
    icon: Trophy,
    href: "/competitions/create",
  },
  {
    title: "Manage Teams",
    description: "View and manage your teams",
    icon: Users,
    href: "/teams",
  },
  {
    title: "Judge Events",
    description: "Score and evaluate competitions",
    icon: ClipboardList,
    href: "/dashboard/judging",
  },
  {
    title: "Messages",
    description: "View your messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
  },
]

export function QuickActions() {
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

