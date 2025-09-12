"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    score: 78,
    avgScore: 72,
  },
  {
    name: "Feb",
    score: 82,
    avgScore: 74,
  },
  {
    name: "Mar",
    score: 85,
    avgScore: 76,
  },
  {
    name: "Apr",
    score: 83,
    avgScore: 78,
  },
  {
    name: "May",
    score: 90,
    avgScore: 80,
  },
  {
    name: "Jun",
    score: 88,
    avgScore: 82,
  },
]

export function ParticipantOverview() {
  return (
    <ResponsiveContainer width="100%" height={300} minHeight={250}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ strokeWidth: 4 }}
          name="Your Score"
        />
        <Line
          type="monotone"
          dataKey="avgScore"
          stroke="#94a3b8"
          strokeWidth={2}
          dot={{ strokeWidth: 4 }}
          name="Average Score"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
