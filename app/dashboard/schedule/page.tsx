import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Calendar } from "@/components/schedule/calendar"
import { DashboardHeader } from "@/app/components/dashboard-header"
import { DashboardShell } from "@/app/components/shell"
import { EmptyPlaceholder } from "@/app/components/empty-placeholder"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Competition Schedule",
  description: "View all competition schedules and events",
}

export default async function SchedulePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Competition Schedule"
        text="View all competition schedules and events"
      />
      <div className="grid gap-8">
        <Calendar />
      </div>
    </DashboardShell>
  )
} 