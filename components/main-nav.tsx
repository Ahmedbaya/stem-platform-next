"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bot, Menu } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/competitions",
      label: "Competitions",
    },
    {
      href: "/teams",
      label: "Teams",
    },
    {
      href: "/results",
      label: "Results",
    },
    {
      href: "/dashboard/competitions",
      label: "My Competitions",
    },
    {
      href: "/dashboard",
      label: "Dashboard",
    },
  ]

  return (
    <div className="flex items-center">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Bot className="h-6 w-6" />
        <span className="font-bold">RoboEvents.tn</span>
      </Link>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <nav className="flex flex-col gap-4">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant="ghost"
                className={cn("justify-start", pathname === route.href && "bg-muted")}
                asChild
              >
                <Link href={route.href}>{route.label}</Link>
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:space-x-4">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant="ghost"
            asChild
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === route.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Link href={route.href}>{route.label}</Link>
          </Button>
        ))}
      </nav>
    </div>
  )
}
