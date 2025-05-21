"use client"

import { Calendar } from "@/components/schedule/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SchedulePreview() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Competition Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar />
      </CardContent>
    </Card>
  )
} 