import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserPlus, Settings, Shield, Database } from "lucide-react"

const actions = [
  {
    title: "User Management",
    description: "Add, edit, or remove users",
    icon: UserPlus,
    href: "/admin/users",
  },
  {
    title: "System Settings",
    description: "Configure platform settings",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    title: "Security Center",
    description: "Manage permissions and access",
    icon: Shield,
    href: "/admin/security",
  },
  {
    title: "Database Tools",
    description: "Backup and maintenance",
    icon: Database,
    href: "/admin/database",
  },
]

export function AdminQuickActions() {
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
