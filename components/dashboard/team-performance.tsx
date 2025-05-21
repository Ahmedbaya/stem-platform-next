"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const data = [
  {
    name: "IRC 2023",
    technical: 85,
    innovation: 92,
    design: 78,
  },
  {
    name: "Robot Wars",
    technical: 88,
    innovation: 90,
    design: 82,
  },
  {
    name: "Nav Challenge",
    technical: 92,
    innovation: 85,
    design: 88,
  },
]

export function TeamPerformance() {
  return (
    <ResponsiveContainer width="100%" height={300} minHeight={250}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="technical" fill="#2563eb" radius={[4, 4, 0, 0]} name="Technical" />
        <Bar dataKey="innovation" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Innovation" />
        <Bar dataKey="design" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Design" />
      </BarChart>
    </ResponsiveContainer>
  )
}
