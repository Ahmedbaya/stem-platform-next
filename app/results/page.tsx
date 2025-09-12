"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy } from "lucide-react"

// Mock data - In a real app, this would come from an API
const results = [
  {
    id: 1,
    competition: "International Robotics Challenge 2024",
    team: "RoboTech Warriors",
    score: 95,
    rank: 1,
    category: "Autonomous Navigation",
  },
  {
    id: 2,
    competition: "International Robotics Challenge 2024",
    team: "Cyber Dynamics",
    score: 88,
    rank: 2,
    category: "Autonomous Navigation",
  },
  {
    id: 3,
    competition: "International Robotics Challenge 2024",
    team: "AI Innovators",
    score: 85,
    rank: 3,
    category: "Autonomous Navigation",
  },
  {
    id: 4,
    competition: "AI Robot Wars",
    team: "Quantum Robotics",
    score: 92,
    rank: 1,
    category: "Object Recognition",
  },
  {
    id: 5,
    competition: "AI Robot Wars",
    team: "RoboTech Warriors",
    score: 87,
    rank: 2,
    category: "Object Recognition",
  },
]

const topTeams = [
  {
    name: "RoboTech Warriors",
    points: 182,
    competitions: 2,
    rank: 1,
  },
  {
    name: "Cyber Dynamics",
    points: 88,
    competitions: 1,
    rank: 2,
  },
  {
    name: "AI Innovators",
    points: 85,
    competitions: 1,
    rank: 3,
  },
]

export default function ResultsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results</h1>
        <p className="text-muted-foreground">View competition results and rankings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topTeams.map((team) => (
          <Card key={team.name}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Rank #{team.rank}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{team.points}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Competitions</p>
                  <p className="text-2xl font-bold">{team.competitions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Competition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Competitions</SelectItem>
            <SelectItem value="irc-2024">Int. Robotics Challenge 2024</SelectItem>
            <SelectItem value="robot-wars">AI Robot Wars</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="navigation">Autonomous Navigation</SelectItem>
            <SelectItem value="recognition">Object Recognition</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="md:ml-auto">
          Export Results
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competition Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">#{result.rank}</TableCell>
                  <TableCell>{result.team}</TableCell>
                  <TableCell>{result.competition}</TableCell>
                  <TableCell>{result.category}</TableCell>
                  <TableCell className="text-right">{result.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
