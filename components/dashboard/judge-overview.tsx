"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Technical",
    yourAvg: 8.2,
    overallAvg: 7.5,
  },
  {
    name: "Innovation",
    yourAvg: 8.7,
    overallAvg: 7.8,
  },
  {
    name: "Design",
    yourAvg: 7.9,
    overallAvg: 7.6,
  },
  {
    name: "Presentation",
    yourAvg: 8.5,
    overallAvg: 8.0,
  },
  {
    name: "Functionality",
    yourAvg: 8.3,
    overallAvg: 7.7,
  },
]

export function JudgeOverview() {
  return (
    <ResponsiveContainer width="100%" height={300} minHeight={250}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
        <YAxis
          dataKey="name"
          type="category"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <Tooltip />
        <Bar dataKey="yourAvg" fill="#2563eb" radius={[0, 4, 4, 0]} name="Your Average" />
        <Bar dataKey="overallAvg" fill="#94a3b8" radius={[0, 4, 4, 0]} name="Overall Average" />
      </BarChart>
    </ResponsiveContainer>
  )
}
