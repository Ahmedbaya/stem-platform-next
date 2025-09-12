"use client"

import { useEffect, useState } from "react"
import { DashboardCompetitionsPage } from "@/components/competitions/participant-competitions-view"
import { getCompetitions } from "@/app/actions/competition-actions"
import type { Competition } from "@/app/actions/competition-actions"

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])

  // Fetch competitions on mount and set up periodic refresh
  useEffect(() => {
    const fetchCompetitions = async () => {
      const response = await getCompetitions()
      if (response.success) {
        setCompetitions(response.competitions)
      }
    }

    // Initial fetch
    fetchCompetitions()

    // Set up periodic refresh every 30 seconds
    const intervalId = setInterval(fetchCompetitions, 30000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  return <DashboardCompetitionsPage competitions={competitions} />
}