"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan",
    registrations: 12,
    submissions: 8,
  },
  {
    name: "Feb",
    registrations: 18,
    submissions: 14,
  },
  {
    name: "Mar",
    registrations: 24,
    submissions: 20,
  },
  {
    name: "Apr",
    registrations: 32,
    submissions: 28,
  },
  {
    name: "May",
    registrations: 38,
    submissions: 30,
  },
  {
    name: "Jun",
    registrations: 42,
    submissions: 34,
  },
]

export function OrganizerOverview() {
  return (
    <ResponsiveContainer width="100%" height={300} minHeight={250}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="registrations" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="submissions" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
