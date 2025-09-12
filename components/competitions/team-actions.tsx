"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"

interface TeamActionsProps {
  teamId: string
  onApprove: (teamId: string) => Promise<{ success: boolean; error?: string }>
  onReject: (teamId: string) => Promise<{ success: boolean; error?: string }>
}

export function TeamActions({ teamId, onApprove, onReject }: TeamActionsProps) {
  const [isLoading, setIsLoading] = useState<"approve" | "reject" | null>(null)
  const router = useRouter()

  async function handleApprove() {
    try {
      setIsLoading("approve")
      const result = await onApprove(teamId)
      if (!result.success) {
        toast.error(result.error || "Failed to approve team")
      } else {
        toast.success("Team approved successfully")
        router.refresh()
      }
    } catch (error) {
      toast.error("An error occurred while approving the team")
    } finally {
      setIsLoading(null)
    }
  }

  async function handleReject() {
    try {
      setIsLoading("reject")
      const result = await onReject(teamId)
      if (!result.success) {
        toast.error(result.error || "Failed to reject team")
      } else {
        toast.success("Team rejected successfully")
        router.refresh()
      }
    } catch (error) {
      toast.error("An error occurred while rejecting the team")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="default"
        size="sm"
        className="gap-2"
        onClick={handleApprove}
        disabled={isLoading !== null}
      >
        <UserCheck className="h-4 w-4" />
        {isLoading === "approve" ? "Approving..." : "Approve"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={handleReject}
        disabled={isLoading !== null}
      >
        <UserX className="h-4 w-4" />
        {isLoading === "reject" ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  )
} 