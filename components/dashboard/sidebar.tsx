"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Trophy,
  Users,
  ClipboardList,
  MessageSquare,
  Settings,
  Shield,
  FileText,
  Calendar,
  Heart,
  Video,
  Bell,
  Database,
  Award,
} from "lucide-react"

// Define navigation routes for each role
const adminRoutes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "User Management",
    icon: Users,
    href: "/dashboard/users",
  },
  {
    label: "Competitions",
    icon: Trophy,
    href: "/dashboard/competitions",
  },
  {
    label: "Schedule",
    icon: Calendar,
    href: "/dashboard/schedule",
  },
  {
    label: "Security",
    icon: Shield,
    href: "/dashboard/security",
  },
  {
    label: "System",
    icon: Database,
    href: "/dashboard/system",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
]

const organizerRoutes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "My Competitions",
    icon: Trophy,
    href: "/dashboard/competitions",
  },
  {
    label: "Teams",
    icon: Users,
    href: "/dashboard/teams",
  },
  {
    label: "Judges",
    icon: ClipboardList,
    href: "/dashboard/judges",
  },
  {
    label: "Schedule",
    icon: Calendar,
    href: "/dashboard/schedule",
  },
  {
    label: "Awards",
    icon: Award,
    href: "/dashboard/awards",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
]

const participantRoutes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Competitions",
    icon: Trophy,
    href: "/dashboard/competitions",
  },
  {
    label: "My Team",
    icon: Users,
    href: "/dashboard/teams",
  },
  {
    label: "Schedule",
    icon: Calendar,
    href: "/dashboard/schedule",
  },
  {
    label: "Submissions",
    icon: FileText,
    href: "/dashboard/submissions",
  },
  {
    label: "Results",
    icon: Award,
    href: "/dashboard/results",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
]

const judgeRoutes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Assigned Competitions",
    icon: Trophy,
    href: "/dashboard/competitions",
  },
  {
    label: "Evaluations",
    icon: ClipboardList,
    href: "/dashboard/evaluations",
  },
  {
    label: "Schedule",
    icon: Calendar,
    href: "/dashboard/schedule",
  },
  {
    label: "Feedback",
    icon: FileText,
    href: "/dashboard/feedback",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
]

const spectatorRoutes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Live Competitions",
    icon: Video,
    href: "/dashboard/competitions",
  },
  {
    label: "Upcoming Events",
    icon: Calendar,
    href: "/dashboard/events",
  },
  {
    label: "Favorite Teams",
    icon: Heart,
    href: "/dashboard/favorites",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/dashboard/notifications",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  
  // Add error handling for useSession to prevent errors when SessionProvider is missing
  let session;
  try {
    const { data } = useSession();
    session = data;
  } catch (error) {
    // If SessionProvider is not available, we'll use a default role
    console.warn("SessionProvider not found. Make sure to wrap your application with SessionProvider.");
    session = null;
  }

  // Get user role from session, default to participant if not available
  const userRole = (session?.user as any)?.role || "participant"

  // Select the appropriate routes based on user role
  let routes = participantRoutes

  switch (userRole) {
    case "admin":
      routes = adminRoutes
      break
    case "organizer":
      routes = organizerRoutes
      break
    case "judge":
      routes = judgeRoutes
      break
    case "spectator":
      routes = spectatorRoutes
      break
    default:
      routes = participantRoutes
  }

  // Check if the current path is active or is a subpath
  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    return pathname.startsWith(href) && href !== "/dashboard"
  }

  return (
    <div className="fixed top-0 left-0 z-30 h-screen w-64 flex-col border-r bg-muted/40 pt-16">
      <div className="flex h-14 items-center border-b px-4 font-semibold">
        {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={isActive(route.href) ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-2", isActive(route.href) && "bg-secondary")}
              asChild
            >
              <Link href={route.href}>
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )
}