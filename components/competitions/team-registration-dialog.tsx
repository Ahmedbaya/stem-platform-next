"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const createTeamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
})

const joinTeamSchema = z.object({
  code: z.string().min(6, "Invalid team code"),
})

interface TeamRegistrationDialogProps {
  competitionId: string
  userEmail: string
}

export function TeamRegistrationDialog({
  competitionId,
  userEmail,
}: TeamRegistrationDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const createTeamForm = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const joinTeamForm = useForm<z.infer<typeof joinTeamSchema>>({
    resolver: zodResolver(joinTeamSchema),
    defaultValues: {
      code: "",
    },
  })

  async function onCreateTeam(data: z.infer<typeof createTeamSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/competitions/${competitionId}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Team creation failed:", {
          status: response.status,
          statusText: response.statusText,
          error: result
        })
        throw new Error(result.error || result.details || "Failed to create team")
      }

      toast.success("Team created successfully! Waiting for organizer approval.")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Team creation error:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function onJoinTeam(data: z.infer<typeof joinTeamSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/competitions/${competitionId}/teams/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: data.code,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Team join failed:", {
          status: response.status,
          statusText: response.statusText,
          error: result
        })
        throw new Error(result.error || "Failed to join team")
      }

      toast.success("Successfully joined the team!")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Team join error:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          Register Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Team Registration</DialogTitle>
          <DialogDescription>
            Create a new team or join an existing one with a team code.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Team</TabsTrigger>
            <TabsTrigger value="join">Join Team</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <Form {...createTeamForm}>
              <form onSubmit={createTeamForm.handleSubmit(onCreateTeam)} className="space-y-4">
                <FormField
                  control={createTeamForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createTeamForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of your team" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Team"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="join">
            <Form {...joinTeamForm}>
              <form onSubmit={joinTeamForm.handleSubmit(onJoinTeam)} className="space-y-4">
                <FormField
                  control={joinTeamForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team code" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the code provided by your team leader
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Joining..." : "Join Team"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 