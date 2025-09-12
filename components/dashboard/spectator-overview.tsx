"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    events: 4,
    watched: 3,
  },
  {
    name: "Feb",
    events: 6,
    watched: 4,
  },
  {
    name: "Mar",
    events: 8,
    watched: 5,
  },
  {
    name: "Apr",
    events: 10,
    watched: 7,
  },
  {
    name: "May",
    events: 12,
    watched: 8,
  },
  {
    name: "Jun",
    events: 14,
    watched: 10,
  },
]

export function SpectatorOverview() {
  return (
    <ResponsiveContainer width="100%" height={300} minHeight={250}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="events"
          stroke="#94a3b8"
          strokeWidth={2}
          dot={{ strokeWidth: 4 }}
          name="Total Events"
        />
        <Line
          type="monotone"
          dataKey="watched"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ strokeWidth: 4 }}
          name="Watched Events"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
