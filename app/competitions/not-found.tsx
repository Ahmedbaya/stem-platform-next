import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CompetitionNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Competition Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The competition you're looking for doesn't exist or has been removed.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/competitions">Browse Competitions</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
