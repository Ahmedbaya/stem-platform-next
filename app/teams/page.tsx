import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users } from "lucide-react"
import Link from "next/link"

// Mock data - In a real app, this would come from an API
const teams = [
  {
    id: 1,
    name: "RoboTech Warriors",
    avatar: "/placeholder.svg?height=40&width=40",
    members: 5,
    competitions: 8,
    wins: 3,
    category: "University",
    location: "MIT",
  },
  {
    id: 2,
    name: "Cyber Dynamics",
    avatar: "/placeholder.svg?height=40&width=40",
    members: 4,
    competitions: 6,
    wins: 2,
    category: "High School",
    location: "Stanford High",
  },
  {
    id: 3,
    name: "AI Innovators",
    avatar: "/placeholder.svg?height=40&width=40",
    members: 6,
    competitions: 12,
    wins: 5,
    category: "Professional",
    location: "Silicon Valley",
  },
  {
    id: 4,
    name: "Quantum Robotics",
    avatar: "/placeholder.svg?height=40&width=40",
    members: 4,
    competitions: 4,
    wins: 1,
    category: "University",
    location: "CalTech",
  },
]

export default function TeamsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Browse and manage robotics teams</p>
        </div>
        <Button asChild>
          <Link href="/teams/create">Create Team</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input placeholder="Search teams..." className="md:w-[300px]" />
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="university">University</SelectItem>
            <SelectItem value="high-school">High School</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="md:ml-auto">
          Filter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={team.avatar} alt={team.name} />
                  <AvatarFallback>{team.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{team.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {team.category} • {team.location}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <Users className="mx-auto h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{team.members}</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
                <div className="space-y-1">
                  <Trophy className="mx-auto h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{team.wins}</p>
                  <p className="text-xs text-muted-foreground">Wins</p>
                </div>
                <div className="space-y-1">
                  <div className="mx-auto h-4 w-4 rounded bg-primary/10 text-center text-[10px] font-medium leading-4 text-primary">
                    {team.competitions}
                  </div>
                  <p className="text-sm font-medium">{team.competitions}</p>
                  <p className="text-xs text-muted-foreground">Competitions</p>
                </div>
              </div>
              <Button className="mt-6 w-full" variant="outline" asChild>
                <Link href={`/teams/${team.id}`}>View Profile</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
