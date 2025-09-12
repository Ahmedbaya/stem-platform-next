"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, FileText, Clock, Award, Loader2, Upload } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Competition {
  id: string
  name: string
  status: string
}

interface Submission {
  id: string
  competitionId: string
  competitionName: string
  submittedAt: string
  status: "pending" | "evaluated" | "rejected"
  score?: number
  feedback?: string
  files: {
    name: string
    url: string
  }[]
}

export default function SubmissionsPage() {
  const { data: session } = useSession()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<string>("")
  const [files, setFiles] = useState<File[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchSubmissions()
    fetchCompetitions()
  }, [])

  async function fetchCompetitions() {
    try {
      const response = await fetch("/api/competitions")
      if (!response.ok) throw new Error("Failed to fetch competitions")
      const data = await response.json()
      setCompetitions(data.filter((c: Competition) => c.status === "active"))
    } catch (error) {
      console.error("Error fetching competitions:", error)
      toast.error("Failed to load competitions")
    }
  }

  async function fetchSubmissions() {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching submissions...")
      
      const response = await fetch("/api/submissions")
      console.log("Response status:", response.status)
      
      const data = await response.json()
      console.log("Response data:", data)
      
      if (!response.ok) {
        throw new Error(
          data.details || data.error || "Failed to fetch submissions"
        )
      }
      
      if (!Array.isArray(data)) {
        console.error("Invalid response format:", data)
        throw new Error("Invalid response format from server")
      }
      
      setSubmissions(data)
      console.log("Submissions set successfully:", data.length)
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch submissions"
      console.error("Error fetching submissions:", {
        error,
        message,
        type: error instanceof Error ? error.name : typeof error
      })
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCompetition || files.length === 0) {
      toast.error("Please select a competition and upload files")
      return
    }

    setSubmitting(true)
    try {
      // First, upload files and get their URLs
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)
          
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })
          
          if (!uploadResponse.ok) {
            throw new Error("Failed to upload file")
          }
          
          const { url } = await uploadResponse.json()
          return {
            name: file.name,
            url: url
          }
        })
      )

      // Create the submission
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          competitionId: selectedCompetition,
          files: uploadedFiles,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create submission")
      }

      toast.success("Submission created successfully")
      setDialogOpen(false)
      setSelectedCompetition("")
      setFiles([])
      fetchSubmissions() // Refresh the submissions list
    } catch (error) {
      console.error("Error creating submission:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create submission")
    } finally {
      setSubmitting(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                Please sign in to view your submissions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Submissions</h1>
        <div className="flex gap-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                New Submission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Submission</DialogTitle>
                <DialogDescription>
                  Submit your entry for a competition
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Competition</label>
                  <Select
                    value={selectedCompetition}
                    onValueChange={setSelectedCompetition}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a competition" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitions.map((competition) => (
                        <SelectItem key={competition.id} value={competition.id}>
                          {competition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Files</label>
                  <div className="border rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFiles(Array.from(e.target.files || []))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            onClick={fetchSubmissions}
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Submission Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter(s => s.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluated</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter(s => s.status === "evaluated").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.length > 0
                ? (
                    submissions.reduce((acc, curr) => acc + (curr.score || 0), 0) /
                    submissions.filter(s => s.score !== undefined).length
                  ).toFixed(1)
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>
            View all your competition submissions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Submissions</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchSubmissions} variant="outline">
                Try Again
              </Button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Submissions Yet</h3>
              <p className="text-sm text-muted-foreground">
                You haven't submitted any entries to competitions yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competition</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.competitionName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(submission.submittedAt), "PPp")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          submission.status === "evaluated"
                            ? "success"
                            : submission.status === "rejected"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {submission.score !== undefined ? submission.score : "Pending"}
                    </TableCell>
                    <TableCell>
                      {submission.files.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline block"
                        >
                          {file.name}
                        </a>
                      ))}
                    </TableCell>
                    <TableCell>
                      {submission.feedback || "No feedback yet"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 