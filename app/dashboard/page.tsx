import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import OrganizerDashboard from "@/components/dashboard/organizer-dashboard"
import ParticipantDashboard from "@/components/dashboard/participant-dashboard"
import JudgeDashboard from "@/components/dashboard/judge-dashboard"
import SpectatorDashboard from "@/components/dashboard/spectator-dashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get user role from session
  const userRole = (session.user as any).role || "participant"

  // Render the appropriate dashboard based on user role
  switch (userRole) {
    case "admin":
      return <AdminDashboard />
    case "organizer":
      return <OrganizerDashboard />
    case "judge":
      return <JudgeDashboard />
    case "spectator":
      return <SpectatorDashboard />
    case "participant":
    default:
      return <ParticipantDashboard />
  }
}
