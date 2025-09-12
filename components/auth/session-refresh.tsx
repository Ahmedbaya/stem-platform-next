"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export function SessionRefresh() {
  const { data: session, update } = useSession()

  useEffect(() => {
    // Set up an interval to check for role updates
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/check-session")
        if (response.ok) {
          const data = await response.json()
          if (data.needsRefresh) {
            // Update the session with new role
            await update()
            toast.info("Your role has been updated. The page will refresh.")
            setTimeout(() => {
              window.location.reload()
            }, 1500)
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(checkInterval)
  }, [update])

  return null
} 