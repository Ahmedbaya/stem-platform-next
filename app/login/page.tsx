import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { Badge } from "@/components/ui/badge"
import { Bot, Trophy, Users, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Login - RoboEvents.tn",
  description: "Login to your RoboEvents.tn account",
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary-foreground" />
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute inset-0 bg-primary [mask-image:radial-gradient(circle_at_center,transparent_45%,black)]" />

        {/* Content */}
        <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
          <Bot className="h-8 w-8" />
          <span className="text-xl font-bold">RoboEvents.tn</span>
        </div>

        <div className="relative z-20 mt-16">
          <div className="space-y-2">
            <Badge
              className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              variant="secondary"
            >
              #1 Robotics Competition Platform
            </Badge>
            <h1 className="text-4xl font-bold">Where Innovation Meets Competition</h1>
            <p className="text-primary-foreground/80 max-w-[420px] text-lg">
              Join thousands of teams worldwide in the most advanced robotics competition platform.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="flex items-center gap-4 rounded-lg bg-primary-foreground/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Global Competitions</h3>
                <p className="text-primary-foreground/70 text-sm">Access prestigious robotics competitions worldwide</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-primary-foreground/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Vibrant Community</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Connect with teams, judges, and organizers globally
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-primary-foreground/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Real-time Updates</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Live scoring, instant results, and competition updates
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link href="/register" className="hover:text-brand underline underline-offset-4">
              Don&apos;t have an account? Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

