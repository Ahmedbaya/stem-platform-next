import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, User } from "lucide-react"

interface ParticipantDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participant: {
    name: string
    email: string
    isLeader?: boolean
  } | null
}

export function ParticipantDetailsDialog({
  open,
  onOpenChange,
  participant
}: ParticipantDetailsDialogProps) {
  if (!participant) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Participant Details</DialogTitle>
          <DialogDescription>
            View detailed information about this team member
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10">
                {participant.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <h3 className="font-semibold">
                {participant.name}
                {participant.isLeader && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                    Leader
                  </span>
                )}
              </h3>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{participant.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 