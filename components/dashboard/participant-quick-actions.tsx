import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserPlus, Clipboard, MessageSquare, FileText } from "lucide-react"

const actions = [
  {
    title: "Join Team",
    description: "Join an existing team",
    icon: UserPlus,
    href: "/teams/join",
  },
  {
    title: "Register for Competition",
    description: "Find and enter competitions",
    icon: Clipboard,
    href: "/competitions",
  },
  {
    title: "Team Chat",
    description: "Communicate with your team",
    icon: MessageSquare,
    href: "/participant/messages",
  },
  {
    title: "Submit Documentation",
    description: "Upload project files",
    icon: FileText,
    href: "/participant/submissions",
  },
]

export function ParticipantQuickActions() {
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
