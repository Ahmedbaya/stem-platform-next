import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCompetition } from "@/app/actions/competition-actions"
import { JudgeEvaluationForm } from "@/components/competitions/judge-evaluation-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function JudgeCompetitionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userRole = (session.user as any).role

  if (userRole !== "judge") {
    redirect("/dashboard")
  }

  const { id } = params
  const result = await getCompetition(id)

  if (!result.success) {
    notFound()
  }

  const competition = result.competition
  const userId = (session.user as any).id

  // Check if judge is assigned to this competition
  if (!competition.judges || !competition.judges.includes(userId)) {
    redirect("/dashboard/competitions")
  }

  return (
    <div className="container py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/competitions">Competitions</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/competitions/${id}`}>{competition.title}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Judge Evaluation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold tracking-tight mb-6">Judge: {competition.title}</h1>
      <JudgeEvaluationForm competition={competition} judgeId={userId} />
    </div>
  )
}
