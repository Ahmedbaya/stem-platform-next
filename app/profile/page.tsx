import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Mail, MapPin, Trophy, Users } from "lucide-react"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CompetitionCard } from "@/components/competitions/competition-card"

// Prevent page caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Team {
  _id: string | any
  name: string
  description?: string
  members: Array<{ email: string; role?: string }>
  competitionId: string | any
}

interface Competition {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  status: "draft" | "published" | "ongoing" | "completed"
  maxTeams: number
  teams?: any[]
  prizePool?: string
  registrationDeadline: string
  organizerId: string
  organizerName?: string
  categories?: string[]
  image?: string
  judges?: any[]
  createdAt?: string
  updatedAt?: string
}

interface UserProfile {
  _id: string
  name: string
  email: string
  image?: string
  bio?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string
  joinedDate: Date
  role?: "user" | "organizer" | "admin"
  teams?: Team[]
  competitions?: Competition[]
  achievements?: {
    title: string
    date: Date
    description: string
  }[]
  stats: OrganizerStats | {
    projectsCompleted: number
    teamsLed: number
    competitionsWon: number
  }
}

interface OrganizerStats {
  competitionsCreated: number
  totalTeamsRegistered: number
  activeCompetitions: number
}

function isOrganizerStats(stats: UserProfile['stats']): stats is OrganizerStats {
  return 'competitionsCreated' in stats
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return (
      <div className="container max-w-6xl py-8">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Welcome to Your Profile</CardTitle>
            <CardDescription className="text-lg">Please log in to access your personalized dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Users className="w-12 h-12 text-white" />
            </div>
            <p className="text-muted-foreground text-center max-w-md">
              Join our community to track your competitions, manage your teams, and connect with other robotics enthusiasts.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Get user profile
    const userProfile = await db
      .collection("users")
      .findOne({ email: session.user.email })

    const isOrganizer = userProfile?.role === "organizer"

    if (isOrganizer) {
      // Get organizer's competitions with stats
      const organizerStats = await db
        .collection("competitions")
        .aggregate([
          {
            $match: {
              organizerId: userProfile._id
            }
          },
          {
            $facet: {
              totalCompetitions: [
                { $count: "count" }
              ],
              totalTeams: [
                { $unwind: { path: "$teams", preserveNullAndEmptyArrays: true } },
                { $group: { _id: null, count: { $sum: 1 } } }
              ],
              activeCompetitions: [
                { $match: { status: { $in: ["ongoing", "published"] } } },
                { $count: "count" }
              ],
              competitions: [
                {
                  $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    startDate: 1,
                    endDate: 1,
                    status: 1,
                    location: 1,
                    maxTeams: 1,
                    teams: 1,
                    prizePool: 1,
                    organizerId: 1,
                    organizerName: 1,
                    registrationDeadline: 1,
                    categories: 1,
                    image: 1,
                    judges: 1,
                    createdAt: 1,
                    updatedAt: 1
                  }
                },
                {
                  $sort: { createdAt: -1 }
                }
              ]
            }
          }
        ])
        .toArray()

      console.log('Debug - Organizer Stats:', JSON.stringify(organizerStats, null, 2))
      console.log('Debug - User Profile ID:', userProfile._id)
      
      const statsData = organizerStats[0]
      const competitions = (statsData?.competitions || []).map((comp: any) => ({
        ...comp,
        _id: comp._id.toString(),
        status: comp.status || 'draft',
        registrationDeadline: comp.registrationDeadline || comp.startDate,
        organizerId: comp.organizerId || userProfile._id.toString(),
        organizerName: comp.organizerName || userProfile.name,
        categories: comp.categories || [],
        image: comp.image || '/placeholder.svg',
        teams: comp.teams || [],
        judges: comp.judges || []
      })) as Competition[]

      console.log('Debug - Competitions:', JSON.stringify(competitions, null, 2))

      const formattedProfile: UserProfile = {
        _id: userProfile._id.toString(),
        name: userProfile.name || session.user.name || "Anonymous User",
        email: userProfile.email || session.user.email,
        image: userProfile.image || session.user.image || undefined,
        bio: userProfile.bio || "No bio provided",
        location: userProfile.location,
        website: userProfile.website,
        github: userProfile.github,
        linkedin: userProfile.linkedin,
        role: userProfile.role,
        joinedDate: userProfile.joinedDate || new Date(),
        competitions,
        achievements: userProfile.achievements || [],
        stats: {
          competitionsCreated: statsData?.totalCompetitions[0]?.count || 0,
          totalTeamsRegistered: statsData?.totalTeams[0]?.count || 0,
          activeCompetitions: statsData?.activeCompetitions[0]?.count || 0
        } as OrganizerStats
      }

      console.log('Debug - Formatted Profile Stats:', formattedProfile.stats)

      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container max-w-6xl py-8 space-y-8">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-8 overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="relative flex flex-col md:flex-row items-start gap-6">
                <div className="relative">
                  {formattedProfile.image ? (
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background shadow-xl">
                      <Image
                        src={formattedProfile.image}
                        alt={formattedProfile.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-4xl text-white font-bold">
                        {formattedProfile.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">{formattedProfile.name}</h1>
                    <p className="text-lg text-muted-foreground mt-1">{formattedProfile.bio}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{formattedProfile.email}</span>
                    </div>
                    {formattedProfile.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{formattedProfile.location}</span>
                      </div>
                    )}
                    <Badge variant="secondary" className="font-normal">
                      Competition Organizer
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {formattedProfile.github && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={formattedProfile.github} target="_blank">
                          <svg viewBox="0 0 438.549 438.549" className="h-4 w-4 mr-2">
                            <path fill="currentColor" d="M409.132,114.573c-19.608-33.596-46.205-60.194-79.798-79.8C295.736,15.166,259.057,5.365,219.271,5.365
                          c-39.781,0-76.472,9.804-110.063,29.408c-33.596,19.605-60.192,46.204-79.8,79.8C9.803,148.168,0,184.854,0,224.63 c0,47.78,13.94,90.745,41.827,128.906c27.884,38.164,63.906,64.572,108.063,79.227c5.14,0.954,8.945,0.283,11.419-1.996
                          c2.475-2.282,3.711-5.14,3.711-8.562c0-0.571-0.049-5.708-0.144-15.417c-0.098-9.709-0.144-18.179-0.144-25.406l-6.567,1.136
                          c-4.187,0.767-9.469,1.092-15.846,1c-6.374-0.089-12.991-0.757-19.842-1.999c-6.854-1.231-13.229-4.086-19.13-8.559
                          c-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559
                          c-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-0.951-2.568-2.098-3.711-3.429c-1.142-1.331-1.997-2.663-2.568-3.997
                          c-0.572-1.335-0.098-2.43,1.427-3.289c1.525-0.859,4.281-1.276,8.28-1.276l5.708,0.853c3.807,0.763,8.516,3.042,14.133,6.851
                          c5.614,3.806,10.229,8.754,13.846,14.842c4.38,7.806,9.657,13.754,15.846,17.847c6.184,4.093,12.419,6.136,18.699,6.136
                          c6.28,0,11.704-0.476,16.274-1.423c4.565-0.952,8.848-2.383,12.847-4.285c1.713-12.758,6.377-22.559,13.988-29.41
                          c-10.848-1.14-20.601-2.857-29.264-5.14c-8.658-2.286-17.605-5.996-26.835-11.14c-9.235-5.137-16.896-11.516-22.985-19.126
                          c-6.09-7.614-11.088-17.61-14.987-29.979c-3.901-12.374-5.852-26.648-5.852-42.826c0-23.035,7.52-42.637,22.557-58.817
                          c-7.044-17.318-6.379-36.732,1.997-58.24c5.52-1.715,13.706-0.428,24.554,3.853c10.85,4.283,18.794,7.952,23.84,10.994
                          c5.046,3.041,9.089,5.618,12.135,7.708c17.705-4.947,35.976-7.421,54.818-7.421s37.117,2.474,54.823,7.421l10.849-6.849
                          c7.419-4.57,16.18-8.758,26.262-12.565c10.088-3.805,17.802-4.853,23.134-3.138c8.562,21.509,9.325,40.922,2.279,58.24
                          c15.036,16.18,22.559,35.787,22.559,58.817c0,16.178-1.958,30.497-5.853,42.966c-3.9,12.471-8.941,22.457-15.125,29.979
                          c-6.191,7.521-13.901,13.85-23.131,18.986c-9.232,5.14-18.182,8.85-26.84,11.136c-8.662,2.286-18.415,4.004-29.263,5.146
                          c9.894,8.562,14.842,22.077,14.842,40.539v60.237c0,3.422,1.19,6.279,3.572,8.562c2.379,2.279,6.136,2.95,11.276,1.995
                          c44.163-14.653,80.185-41.062,108.068-79.226c27.88-38.161,41.825-81.126,41.825-128.906
                          C438.536,184.851,428.728,148.168,409.132,114.573z"/>
                          </svg>
                          GitHub
                        </Link>
                      </Button>
                    )}
                    {formattedProfile.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={formattedProfile.linkedin} target="_blank">
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </Link>
                      </Button>
                    )}
                    {formattedProfile.website && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={formattedProfile.website} target="_blank">
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          Website
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="pt-4">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white" asChild>
                      <Link href="/profile/edit">Edit Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-background">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-500/20">
                      <Trophy className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Competitions Created</p>
                      <h3 className="text-2xl font-bold">
                        {(formattedProfile.stats as OrganizerStats).competitionsCreated}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-background">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-500/20">
                      <Users className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Teams Registered</p>
                      <h3 className="text-2xl font-bold">
                        {(formattedProfile.stats as OrganizerStats).totalTeamsRegistered}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-background">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500/20">
                      <CalendarDays className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Competitions</p>
                      <h3 className="text-2xl font-bold">
                        {(formattedProfile.stats as OrganizerStats).activeCompetitions}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            {formattedProfile.achievements && formattedProfile.achievements.length > 0 && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Achievements</CardTitle>
                  <CardDescription>Notable accomplishments and recognition</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formattedProfile.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg border bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5">
                        <div className="p-2 rounded-full bg-yellow-500/20">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )
    }

    // Regular user profile code continues here...
    // ... rest of the existing code for non-organizer users ...
  } catch (error) {
    console.error('Error loading profile:', error)
    return (
      <div className="container max-w-6xl py-8">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Error</CardTitle>
            <CardDescription>Failed to load profile information</CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-2xl">!</span>
            </div>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              An error occurred while loading your profile. Please try again later.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
} 