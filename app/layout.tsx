import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { AuthProvider } from "@/components/auth-provider"
import { ErrorBoundary } from "./components/error-boundary"
import { SessionRefresh } from "@/components/auth/session-refresh"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RoboEvents.tn - Robotics Competition Platform",
  description: "Modern platform for organizing and managing robotics competitions",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ErrorBoundary>
          <AuthProvider>
            <Providers>
              <Toaster />
              <SessionRefresh />
              <div className="relative flex min-h-screen flex-col">
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="container flex h-16 items-center">
                    <MainNav />
                    <div className="ml-auto flex items-center space-x-4">
                      <UserNav />
                    </div>
                  </div>
                </header>
                <main className="flex-1">{children}</main>
              </div>
            </Providers>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
