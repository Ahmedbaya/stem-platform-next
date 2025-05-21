"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateCompetitionStatus } from "@/app/actions/update-competition"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UpdateStatusButtonProps {
  competitionId: string
  currentStatus: "draft" | "published" | "ongoing" | "completed"
}

export function UpdateStatusButton({ competitionId, currentStatus }: UpdateStatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStatusUpdate = async () => {
    try {
      setIsLoading(true)
      const newStatus = currentStatus === "draft" ? "published" : "draft"
      
      const result = await updateCompetitionStatus(competitionId, newStatus)
      
      if (result.success) {
        toast.success(`Competition ${newStatus === "published" ? "published" : "unpublished"} successfully`)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch (error) {
      toast.error("An error occurred while updating status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant={currentStatus === "draft" ? "default" : "secondary"}
      onClick={handleStatusUpdate}
      disabled={isLoading}
    >
      {isLoading ? "Updating..." : currentStatus === "draft" ? "Publish" : "Unpublish"}
    </Button>
  )
} 