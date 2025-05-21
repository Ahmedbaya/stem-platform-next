import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Image from "next/image"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { Bot } from "lucide-react"

export const metadata: Metadata = {
  title: "Register - RoboEvents.tn",
  description: "Create your RoboEvents.tn account",
}

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute inset-0 bg-primary [mask-image:radial-gradient(circle_at_center,transparent_45%,black)]" />

        <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
          <Bot className="w-6 h-6" />
          RoboEvents.tn
        </div>

        <div className="relative z-20 mt-16">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Join the Future of Robotics Competitions</h1>
            <p className="text-primary-foreground/80 max-w-[420px] text-lg">
              Connect with teams, participate in competitions, and showcase your robotics innovations.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="flex items-center gap-4 rounded-lg bg-primary-foreground/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">🏆</div>
              <div>
                <h3 className="font-semibold">Global Competitions</h3>
                <p className="text-primary-foreground/70 text-sm">Participate in worldwide robotics events</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-primary-foreground/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">👥</div>
              <div>
                <h3 className="font-semibold">Team Collaboration</h3>
                <p className="text-primary-foreground/70 text-sm">Build and manage your robotics team</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-primary-foreground/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">📊</div>
              <div>
                <h3 className="font-semibold">Real-time Scoring</h3>
                <p className="text-primary-foreground/70 text-sm">Track your performance live</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="hover:text-brand underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

