"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    score: 80,
  },
  {
    name: "Feb",
    score: 75,
  },
  {
    name: "Mar",
    score: 85,
  },
  {
    name: "Apr",
    score: 82,
  },
  {
    name: "May",
    score: 90,
  },
  {
    name: "Jun",
    score: 88,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={300} minHeight={250}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ strokeWidth: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

