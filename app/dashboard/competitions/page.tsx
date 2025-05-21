"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { CompetitionCard } from "@/components/competitions/competition-card"
import { deleteCompetition } from "@/app/actions/delete-competition"

interface Team {
  _id: string
  name: string
  status: "pending" | "approved" | "rejected"
  leader: string
  members: string[]
  code?: string
  createdAt: Date
}

interface Competition {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  location: string
  maxTeams: number
  status: "draft" | "published" | "ongoing" | "completed"
  teams: string[]
  teamDetails?: Team[]
  organizerId: string
  organizerName?: string
  image?: string
  prizePool?: string
}

export default function DashboardCompetitionsPage() {
  const { data: session, status } = useSession()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  const isOrganizer = (session?.user as any)?.role === "organizer"

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const response = await fetch('/api/competitions/my-competitions')
        if (!response.ok) throw new Error('Failed to fetch competitions')
        const data = await response.json()
        setCompetitions(data)
      } catch (error) {
        console.error('Error fetching competitions:', error)
        toast.error('Failed to load competitions')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.email) {
      fetchCompetitions()
    }
  }, [session])

  const handleDelete = async (competitionId: string) => {
    try {
      const result = await deleteCompetition(competitionId)
      
      if (result.success) {
        toast.success('Competition deleted successfully')
        // Remove the competition from the local state
        setCompetitions(prev => prev.filter(comp => comp._id !== competitionId))
      } else {
        toast.error(result.error || 'Failed to delete competition')
      }
    } catch (error) {
      toast.error('An error occurred while deleting the competition')
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">Please sign in to view your competitions</p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isOrganizer ? "My Competitions" : "My Registered Competitions"}
          </h1>
          <p className="text-muted-foreground">
            {isOrganizer 
              ? "Manage your robotics competitions" 
              : "View competitions you're participating in"}
          </p>
        </div>
        {isOrganizer && (
          <Button asChild>
            <Link href="/dashboard/competitions/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Competition
            </Link>
          </Button>
        )}
      </div>

      {competitions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => (
            <CompetitionCard
              key={competition._id}
              competition={competition}
              role={isOrganizer ? "organizer" : "participant"}
              onDelete={isOrganizer ? () => handleDelete(competition._id) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold">
            {isOrganizer 
              ? "No competitions yet" 
              : "You haven't joined any competitions yet"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isOrganizer 
              ? "Create your first competition to get started"
              : "Join a competition to get started"}
          </p>
          {isOrganizer && (
            <Button className="mt-4" asChild>
              <Link href="/dashboard/competitions/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Competition
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
} 