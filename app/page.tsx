"use client";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Zap, ArrowRight, Calendar, MapPin, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
import { useEffect, useState } from "react"
import { SchedulePreview } from "@/components/home/schedule-preview"
import { BackgroundCarousel } from "@/components/home/background-carousel"
import { CountUpAnimation } from "@/components/ui/count-up"
import { SponsorsSection } from "@/components/home/sponsors-section"

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
  image?: string
  categories?: string[]
}

export default function HomePage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const response = await fetch('/api/competitions')
        const data = await response.json()
        setCompetitions(data)
      } catch (error) {
        console.error('Error fetching competitions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitions()
  }, [])

  const words = [
    {
      text: "Where Innovation Meets Competition",
      className: "text-blue-500 dark:text-blue-500",
    }
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section */}
      <div className="relative min-h-[80vh] flex flex-col justify-center">
        <BackgroundCarousel />
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30" variant="secondary">
              #1 Robotics Competition Platform in Tunisia
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              Where <span className="text-blue-500 dark:text-blue-500">Innovation</span> Meets <span className="text-blue-500 dark:text-blue-500">Competition</span>
            </h1>
            <p className="max-w-[600px] text-base sm:text-lg text-gray-200">
              Join thousands of teams worldwide in the most advanced robotics
              competition platform. Showcase your innovations and compete with
              the best.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20" asChild>
                <Link href="/competitions">Browse Competitions</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Competitions Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Competitions</h2>
          <p className="mt-4 text-lg text-muted-foreground dark:text-muted-foreground/90">
            Discover the most exciting robotics competitions happening around the world
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground dark:text-muted-foreground/90">
                Loading competitions...
              </p>
            </div>
          ) : competitions.length > 0 ? (
            competitions.map((competition) => (
              <Card key={competition._id} className="group overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-primary/10">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={competition.image || '/placeholder.svg?height=200&width=400'}
                    alt={competition.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent dark:from-black/80" />
                  {competition.categories?.[0] && (
                    <Badge className="absolute right-4 top-4 bg-primary/90 text-primary-foreground dark:bg-primary/80">
                      {competition.categories[0]}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{competition.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-2 text-muted-foreground dark:text-muted-foreground/90">
                    {competition.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary dark:text-primary/90" />
                      <span>{new Date(competition.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary dark:text-primary/90" />
                      <span>{competition.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary dark:text-primary/90" />
                      <span>
                        {Math.ceil(
                          (new Date(competition.endDate).getTime() - new Date(competition.startDate).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} days
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-semibold text-primary dark:text-primary/90">
                        {competition.prizePool || 'Prize TBA'}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/competitions/${competition._id}`}>Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground dark:text-muted-foreground/90">
                No upcoming competitions at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Section */}
      <div className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Competition Schedule</h2>
          <p className="mt-4 text-lg text-muted-foreground dark:text-muted-foreground/90">
            View upcoming competitions and events
          </p>
        </div>
        <SchedulePreview />
      </div>

      {/* Stats Section */}
      <div className="bg-primary py-16 text-primary-foreground dark:bg-primary/90">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 text-center">
              <h3 className="text-4xl font-bold sm:text-5xl">
                <CountUpAnimation end={500} suffix="+" />
              </h3>
              <p className="text-primary-foreground/90 dark:text-primary-foreground/80">
                Active competitions worldwide
              </p>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-4xl font-bold sm:text-5xl">
                <CountUpAnimation end={50} suffix="k+" />
              </h3>
              <p className="text-primary-foreground/90 dark:text-primary-foreground/80">
                Registered participants
              </p>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-4xl font-bold sm:text-5xl">
                <CountUpAnimation prefix="$" end={2} suffix="M+" />
              </h3>
              <p className="text-primary-foreground/90 dark:text-primary-foreground/80">
                Prize pool distributed
              </p>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-4xl font-bold sm:text-5xl">
                <CountUpAnimation end={100} suffix="+" />
              </h3>
              <p className="text-primary-foreground/90 dark:text-primary-foreground/80">
                Partner universities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsors Section */}
      <SponsorsSection />

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="dark:hover:border-primary/30">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                <Trophy className="h-6 w-6 text-primary dark:text-primary/90" />
              </div>
              <div>
                <h3 className="font-semibold">Global Competitions</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">Access prestigious robotics competitions worldwide</p>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:hover:border-primary/30">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                <Users className="h-6 w-6 text-primary dark:text-primary/90" />
              </div>
              <div>
                <h3 className="font-semibold">Vibrant Community</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">Connect with teams, judges, and organizers globally</p>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:hover:border-primary/30">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                <Zap className="h-6 w-6 text-primary dark:text-primary/90" />
              </div>
              <div>
                <h3 className="font-semibold">Real-time Updates</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">Live scoring, instant results, and competition updates</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
