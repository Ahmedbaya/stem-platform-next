import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, FileText, MessageSquare, Calendar } from "lucide-react"

const actions = [
  {
    title: "Score Submissions",
    description: "Evaluate team performances",
    icon: ClipboardCheck,
    href: "/judge/score",
  },
  {
    title: "Provide Feedback",
    description: "Give detailed feedback to teams",
    icon: FileText,
    href: "/judge/feedback",
  },
  {
    title: "Contact Organizers",
    description: "Communicate with event staff",
    icon: MessageSquare,
    href: "/judge/messages",
  },
  {
    title: "View Schedule",
    description: "Check your judging assignments",
    icon: Calendar,
    href: "/judge/schedule",
  },
]

export function JudgeQuickActions() {
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
