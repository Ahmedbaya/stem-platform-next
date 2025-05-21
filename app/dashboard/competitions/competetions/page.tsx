import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AdminCompetitionsView } from "@/components/competitions/admin-competitions-view"
import { OrganizerCompetitionsView } from "@/components/competitions/organizer-competitions-view"
import { ParticipantCompetitionsView } from "@/components/competitions/participant-competitions-view"
import { JudgeCompetitionsView } from "@/components/competitions/judge-competitions-view"
import { SpectatorCompetitionsView } from "@/components/competitions/spectator-competitions-view"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { UserRole } from "@/lib/auth-types"

// Define types based on the expected Competition type
type CompetitionStatus = "draft" | "published" | "ongoing" | "completed" | "cancelled";

interface Competition {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  categories: string[];
  maxTeams: number;
  registrationDeadline: string;
  prizePool: string;
  status: CompetitionStatus; // Use the specific type here
  organizerId: string;
  organizerName: string;
  createdAt: string;
  updatedAt: string;
  image: string;
  teams: string[];
  judges: string[];
}

// Mock data for competitions with proper types
const mockCompetitions: Competition[] = [
  {
    _id: "1",
    title: "International Robotics Challenge 2024",
    description: "The premier robotics competition for university students worldwide.",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    location: "San Francisco, CA",
    categories: ["Autonomous Navigation", "Robot Design", "AI Integration"],
    maxTeams: 32,
    registrationDeadline: "2024-02-15",
    prizePool: "$50,000",
    status: "published", // Using the specific allowed value
    organizerId: "org1",
    organizerName: "Tech University",
    createdAt: "2023-10-01T00:00:00.000Z",
    updatedAt: "2023-10-01T00:00:00.000Z",
    image: "/placeholder.svg?height=400&width=600",
    teams: [],
    judges: [],
  },
  {
    _id: "2",
    title: "AI Robot Wars",
    description: "Battle of the smartest robots using cutting-edge AI algorithms.",
    startDate: "2024-04-05",
    endDate: "2024-04-07",
    location: "Boston, MA",
    categories: ["Combat Robotics", "Machine Learning", "Computer Vision"],
    maxTeams: 24,
    registrationDeadline: "2024-03-01",
    prizePool: "$25,000",
    status: "published", // Using the specific allowed value
    organizerId: "org2",
    organizerName: "AI Research Institute",
    createdAt: "2023-11-15T00:00:00.000Z",
    updatedAt: "2023-11-15T00:00:00.000Z",
    image: "/placeholder.svg?height=400&width=600",
    teams: [],
    judges: [],
  },
  {
    _id: "3",
    title: "Autonomous Navigation Championship",
    description: "Test your robot's ability to navigate complex environments autonomously.",
    startDate: "2024-02-01",
    endDate: "2024-02-03",
    location: "Tokyo, Japan",
    categories: ["Path Planning", "Sensor Integration", "Obstacle Avoidance"],
    maxTeams: 48,
    registrationDeadline: "2024-01-01",
    prizePool: "$75,000",
    status: "ongoing", // Using the specific allowed value
    organizerId: "org3",
    organizerName: "Robotics Association of Japan",
    createdAt: "2023-09-01T00:00:00.000Z",
    updatedAt: "2023-09-01T00:00:00.000Z",
    image: "/placeholder.svg?height=400&width=600",
    teams: ["team1", "team2"],
    judges: ["judge1"],
  },
  {
    _id: "4",
    title: "Junior Robotics League",
    description: "A competition for high school students to showcase their robotics skills.",
    startDate: "2024-05-10",
    endDate: "2024-05-12",
    location: "Chicago, IL",
    categories: ["Educational Robotics", "STEM", "Innovation"],
    maxTeams: 50,
    registrationDeadline: "2024-04-15",
    prizePool: "$15,000",
    status: "draft", // Using the specific allowed value
    organizerId: "org1",
    organizerName: "Tech University",
    createdAt: "2023-12-01T00:00:00.000Z",
    updatedAt: "2023-12-01T00:00:00.000Z",
    image: "/placeholder.svg?height=400&width=600",
    teams: [],
    judges: [],
  },
]

export default async function DashboardCompetitionsPage() {
  // Get user role from session like we do in dashboard/page.tsx
  const session = await getServerSession(authOptions)
  
  // In a real app, this would come from the session
  // Fall back to "participant" if role is not defined
  const userRole = (session?.user as any)?.role || "participant" as UserRole
  const userId = (session?.user as any)?.id || "org1" // Fallback for demo purposes

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Competitions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
        <p className="text-muted-foreground">
          {userRole === "admin" && "Manage all competitions on the platform"}
          {userRole === "organizer" && "Create and manage your competitions"}
          {userRole === "participant" && "Browse and register for competitions"}
          {userRole === "judge" && "View and judge your assigned competitions"}
          {userRole === "spectator" && "Browse and follow robotics competitions"}
        </p>
      </div>

      {userRole === "admin" && <AdminCompetitionsView competitions={mockCompetitions} />}
      {userRole === "organizer" && <OrganizerCompetitionsView competitions={mockCompetitions} userId={userId} />}
      {userRole === "participant" && <ParticipantCompetitionsView competitions={mockCompetitions} userId={userId} />}
      {userRole === "judge" && <JudgeCompetitionsView competitions={mockCompetitions} userId={userId} />}
      {userRole === "spectator" && <SpectatorCompetitionsView competitions={mockCompetitions} />}
    </div>
  )
}