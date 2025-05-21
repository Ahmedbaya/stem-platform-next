"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { type Competition, submitEvaluation } from "@/app/actions/competition-actions"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const formSchema = z.object({
  teamId: z.string().min(1, {
    message: "Please select a team to evaluate.",
  }),
  technical: z.number().min(0).max(100),
  innovation: z.number().min(0).max(100),
  design: z.number().min(0).max(100),
  presentation: z.number().min(0).max(100),
  comments: z.string().min(10, {
    message: "Comments must be at least 10 characters.",
  }),
})

interface JudgeEvaluationFormProps {
  competition: Competition
  judgeId: string
}

export function JudgeEvaluationForm({ competition, judgeId }: JudgeEvaluationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamId: "",
      technical: 50,
      innovation: 50,
      design: 50,
      presentation: 50,
      comments: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const result = await submitEvaluation(competition._id!, values.teamId, {
        technical: values.technical,
        innovation: values.innovation,
        design: values.design,
        presentation: values.presentation,
        comments: values.comments,
      })

      if (result.success) {
        toast.success("Evaluation submitted successfully")
        form.reset()
      } else {
        toast.error(`Failed to submit evaluation: ${result.error}`)
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${(error as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total score
  const totalScore =
    form.watch("technical") + form.watch("innovation") + form.watch("design") + form.watch("presentation")

  return (
    <div>
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/competitions/${competition._id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Competition
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Team</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a team to evaluate" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {competition.teams && competition.teams.length > 0 ? (
                              competition.teams.map((teamId) => (
                                <SelectItem key={teamId} value={teamId}>
                                  Team ID: {teamId}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No teams registered
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose the team you want to evaluate</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technical Evaluation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="technical"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technical Score: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>Evaluate the technical implementation and functionality</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="innovation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Innovation Score: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>Evaluate the creativity and innovation of the solution</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="design"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Design Score: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>Evaluate the physical design and construction</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="presentation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presentation Score: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>Evaluate the team's presentation and communication</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback and Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide detailed feedback for the team..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include strengths, areas for improvement, and specific feedback
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Evaluation"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Technical Score</p>
                <p className="text-2xl font-bold">{form.watch("technical")}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Innovation Score</p>
                <p className="text-2xl font-bold">{form.watch("innovation")}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Design Score</p>
                <p className="text-2xl font-bold">{form.watch("design")}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Presentation Score</p>
                <p className="text-2xl font-bold">{form.watch("presentation")}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium">Total Score</p>
                <p className="text-3xl font-bold">{totalScore} / 400</p>
                <p className="text-sm text-muted-foreground">{Math.round((totalScore / 400) * 100)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
