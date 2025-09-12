"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Competition {
  _id: string
  title: string
  startDate: string
  endDate: string
  status: string
  organizerName: string
  location: string
}

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ["competitions"],
    queryFn: async () => {
      const response = await fetch("/api/competitions")
      if (!response.ok) throw new Error("Failed to fetch competitions")
      return response.json()
    }
  })

  const firstDayOfMonth = startOfMonth(currentMonth)
  const lastDayOfMonth = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth })

  const getCompetitionsForDay = (date: Date) => {
    return competitions.filter((competition: Competition) => {
      const start = new Date(competition.startDate)
      const end = new Date(competition.endDate)
      return date >= start && date <= end
    })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-sm font-medium py-2">
            {day}
          </div>
        ))}

        {days.map((day, dayIdx) => {
          const dayCompetitions = getCompetitionsForDay(day)
          
          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[100px] p-2 border rounded-md",
                !isSameMonth(day, currentMonth) && "opacity-50",
                isToday(day) && "bg-muted"
              )}
            >
              <div className="text-sm font-medium">
                {format(day, "d")}
              </div>
              <div className="mt-1 space-y-1">
                <TooltipProvider>
                  {dayCompetitions.map((competition: Competition) => (
                    <Tooltip key={competition._id}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity",
                            competition.status === "published" 
                              ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100" 
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100"
                          )}
                        >
                          {competition.title}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">{competition.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(competition.startDate), "MMM d")} - {format(new Date(competition.endDate), "MMM d, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Organizer: {competition.organizerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Location: {competition.location}
                          </p>
                          <p className="text-xs capitalize">{competition.status}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          )
        })}
      </div>

      {isLoading && (
        <div className="text-center py-4">
          Loading competitions...
        </div>
      )}
    </Card>
  )
} 