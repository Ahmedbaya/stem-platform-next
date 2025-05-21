"use server"

// This is a simplified version of the competition actions file
// In a real app, this would interact with a database

import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"

export interface Award {
  name: string
  prize?: string
  description?: string
}

export interface Team {
  _id: string
  name: string
  members: string[]
  isApproved: boolean
  registeredAt: Date | string
  approvedAt?: Date | string
}

export interface Competition {
  _id: string
  title: string
  description: string
  type?: string
  startDate: string
  endDate: string
  registrationDeadline: string | Date
  maxTeams: number
  location: string
  status: "draft" | "published" | "ongoing" | "completed"
  organizerId?: string
  organizerName?: string
  categories?: string[]
  teams?: (Team | string)[]
  judges?: string[]
  createdAt?: string | Date
  updatedAt?: string | Date
  image?: string
  prizePool?: string
  awards?: Award[]
  evaluationCriteria?: {
    name: string
    description: string
    weight: number
    maxScore: number
  }[]
}

export interface TeamMember {
  _id: string
  name: string
  email: string
  role: string
}

// Mock function to get competitions
export async function getCompetitions() {
  try {
    const client = await clientPromise
    const db = client.db()
    const competitions = await db.collection("competitions").find({}).toArray()
    return {
      success: true,
      competitions: competitions.map(comp => ({
        ...comp,
        _id: comp._id.toString()
      }))
    }
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return {
      success: false,
      error: "Failed to fetch competitions"
    }
  }
}

// Mock function to get a single competition
export async function getCompetition(id: string) {
  try {
    const mockTeamMembers: TeamMember[] = [
      {
        _id: "member1",
        name: "John Doe",
        email: "john@example.com",
        role: "Team Lead"
      },
      {
        _id: "member2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "Engineer"
      },
      {
        _id: "member3",
        name: "Bob Wilson",
        email: "bob@example.com",
        role: "Developer"
      }
    ];

    const mockTeams: Team[] = [
      {
        _id: "team1",
        name: "RoboMasters",
        members: mockTeamMembers.map(member => member._id),
        isApproved: true,
        registeredAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      }
    ];

    const mockCompetitions: Competition[] = [
      {
        _id: "1",
        title: "International Robotics Challenge 2024",
        description: "The premier robotics competition for university students worldwide.",
        startDate: "2024-03-15",
        endDate: "2024-03-17",
        location: "San Francisco, CA",
        categories: ["Autonomous Navigation", "Robot Design", "AI Integration"],
        maxTeams: 32,
        registrationDeadline: "2024-02-15",
        prizePool: "$50,000",
        status: "published",
        organizerId: "org1",
        organizerName: "Tech University",
        createdAt: "2023-10-01T00:00:00.000Z",
        updatedAt: "2023-10-01T00:00:00.000Z",
        image: "/placeholder.svg?height=400&width=600",
        teams: mockTeams,
        judges: [],
        awards: [
          {
            name: "First Place",
            prize: "$25,000",
            description: "Overall winner of the competition"
          },
          {
            name: "Second Place",
            prize: "$15,000"
          },
          {
            name: "Third Place",
            prize: "$10,000"
          },
          {
            name: "Best Innovation",
            prize: "$5,000",
            description: "Most innovative solution"
          }
        ]
      },
      {
        _id: "2",
        title: "AI Robot Wars",
        description: "Battle of the smartest robots using cutting-edge AI algorithms.",
        startDate: "2024-04-05",
        endDate: "2024-04-07",
        location: "Boston, MA",
        categories: ["Combat Robotics", "Machine Learning", "Computer Vision"],
        maxTeams: 24,
        registrationDeadline: "2024-03-01",
        prizePool: "$25,000",
        status: "published",
        organizerId: "org2",
        organizerName: "AI Research Institute",
        createdAt: "2023-11-15T00:00:00.000Z",
        updatedAt: "2023-11-15T00:00:00.000Z",
        image: "/placeholder.svg?height=400&width=600",
        teams: [],
        judges: [],
        awards: [
          {
            name: "First Place",
            prize: "$15,000",
            description: "Overall winner of the competition"
          },
          {
            name: "Second Place",
            prize: "$10,000"
          },
          {
            name: "Best Strategy",
            prize: "$5,000",
            description: "Most effective strategy"
          }
        ]
      },
      {
        _id: "3",
        title: "Autonomous Navigation Championship",
        description: "Test your robot's ability to navigate complex environments autonomously.",
        startDate: "2024-02-01",
        endDate: "2024-02-03",
        location: "Tokyo, Japan",
        categories: ["Path Planning", "Sensor Integration", "Obstacle Avoidance"],
        maxTeams: 48,
        registrationDeadline: "2024-01-01",
        prizePool: "$75,000",
        status: "ongoing",
        organizerId: "org3",
        organizerName: "Robotics Association of Japan",
        createdAt: "2023-09-01T00:00:00.000Z",
        updatedAt: "2023-09-01T00:00:00.000Z",
        image: "/placeholder.svg?height=400&width=600",
        teams: ["team1", "team2"],
        judges: ["judge1"],
        awards: [
          {
            name: "First Place",
            prize: "$30,000",
            description: "Overall winner of the competition"
          },
          {
            name: "Second Place",
            prize: "$20,000"
          },
          {
            name: "Best Path Planning",
            prize: "$10,000",
            description: "Most effective path planning"
          }
        ]
      },
      {
        _id: "4",
        title: "Junior Robotics League",
        description: "A competition for high school students to showcase their robotics skills.",
        startDate: "2024-05-10",
        endDate: "2024-05-12",
        location: "Chicago, IL",
        categories: ["Educational Robotics", "STEM", "Innovation"],
        maxTeams: 50,
        registrationDeadline: "2024-04-15",
        prizePool: "$15,000",
        status: "draft",
        organizerId: "org1",
        organizerName: "Tech University",
        createdAt: "2023-12-01T00:00:00.000Z",
        updatedAt: "2023-12-01T00:00:00.000Z",
        image: "/placeholder.svg?height=400&width=600",
        teams: [],
        judges: [],
        awards: [
          {
            name: "First Place",
            prize: "$7,500",
            description: "Overall winner of the competition"
          },
          {
            name: "Second Place",
            prize: "$5,000"
          },
          {
            name: "Best Educational Project",
            prize: "$2,500",
            description: "Most effective educational project"
          }
        ]
      },
    ]

    const competition = mockCompetitions.find((comp) => comp._id === id)

    if (!competition) {
      return {
        success: false,
        error: "Competition not found",
      }
    }

    return {
      success: true,
      competition,
    }
  } catch (error) {
    console.error("Error fetching competition:", error)
    return {
      success: false,
      error: "Failed to fetch competition",
    }
  }
}

// Function to create a competition
export async function createCompetition(data: Omit<Competition, "_id" | "createdAt" | "updatedAt">) {
  try {
    // In a real app, you would save to the database here
    // Example MongoDB query:
    // const result = await db.collection("competitions").insertOne({
    //   ...data,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    //   awards: data.awards || [] // Ensure awards are saved
    // })

    return {
      success: true,
      competitionId: "new-competition-id",
    }
  } catch (error) {
    console.error("Error creating competition:", error)
    return {
      success: false,
      error: "Failed to create competition",
    }
  }
}

// Function to update competition awards
export async function updateCompetitionAwards(competitionId: string, awards: Award[]) {
  try {
    // In a real app, you would update the database here
    // Example MongoDB query:
    // const result = await db.collection("competitions").updateOne(
    //   { _id: new ObjectId(competitionId) },
    //   { $set: { awards, updatedAt: new Date() } }
    // )

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating competition awards:", error)
    return {
      success: false,
      error: "Failed to update competition awards",
    }
  }
}

// Mock function to update a competition
export async function updateCompetition(id: string, data: Partial<Competition>) {
  try {
    // This is where you would normally update a database
    // For now, we'll just return success
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating competition:", error)
    return {
      success: false,
      error: "Failed to update competition",
    }
  }
}

// Mock function to delete a competition
export async function deleteCompetition(id: string) {
  try {
    // This is where you would normally delete from a database
    // For now, we'll just return success
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting competition:", error)
    return {
      success: false,
      error: "Failed to delete competition",
    }
  }
}

// Mock function to register for a competition
export async function registerForCompetition(competitionId: string, teamId: string) {
  try {
    // This is where you would normally update a database
    // For now, we'll just return success
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error registering for competition:", error)
    return {
      success: false,
      error: "Failed to register for competition",
    }
  }
}

// Mock function to submit an evaluation
export async function submitEvaluation(
  competitionId: string,
  teamId: string,
  evaluation: {
    technical: number
    innovation: number
    design: number
    presentation: number
    comments: string
  },
) {
  try {
    // This is where you would normally update a database
    // For now, we'll just return success
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error submitting evaluation:", error)
    return {
      success: false,
      error: "Failed to submit evaluation",
    }
  }
}

// Function to register a team for a competition
export async function registerTeam(competitionId: string, team: Omit<Team, '_id' | 'isApproved' | 'registeredAt' | 'approvedAt'>) {
  try {
    // In a real app, you would update the database here
    // Example MongoDB query:
    // const newTeam = {
    //   ...team,
    //   isApproved: false,
    //   registeredAt: new Date()
    // }
    // const result = await db.collection("competitions").updateOne(
    //   { _id: new ObjectId(competitionId) },
    //   { 
    //     $push: { teams: newTeam },
    //     $set: { updatedAt: new Date() }
    //   }
    // )

    return {
      success: true,
      message: "Team registration submitted for approval"
    }
  } catch (error) {
    console.error("Error registering team:", error)
    return {
      success: false,
      error: "Failed to register team"
    }
  }
}

// Function to approve a team
export async function approveTeam(competitionId: string, teamId: string) {
  try {
    // In a real app, you would update the database here
    // Example MongoDB query:
    // const result = await db.collection("competitions").updateOne(
    //   { 
    //     _id: new ObjectId(competitionId),
    //     "teams._id": new ObjectId(teamId)
    //   },
    //   { 
    //     $set: { 
    //       "teams.$.isApproved": true,
    //       "teams.$.approvedAt": new Date(),
    //       updatedAt: new Date()
    //     }
    //   }
    // )

    return {
      success: true,
      message: "Team approved successfully"
    }
  } catch (error) {
    console.error("Error approving team:", error)
    return {
      success: false,
      error: "Failed to approve team"
    }
  }
}

// Function to remove a team
export async function removeTeam(competitionId: string, teamId: string) {
  try {
    // In a real app, you would update the database here
    // Example MongoDB query:
    // const result = await db.collection("competitions").updateOne(
    //   { _id: new ObjectId(competitionId) },
    //   { 
    //     $pull: { teams: { _id: new ObjectId(teamId) } },
    //     $set: { updatedAt: new Date() }
    //   }
    // )

    return {
      success: true,
      message: "Team removed successfully"
    }
  } catch (error) {
    console.error("Error removing team:", error)
    return {
      success: false,
      error: "Failed to remove team"
    }
  }
}

// Function to get competition teams
export async function getCompetitionTeams(competitionId: string) {
  try {
    // In a real app, you would query the database here
    // Example MongoDB query:
    // const competition = await db.collection("competitions")
    //   .findOne(
    //     { _id: new ObjectId(competitionId) },
    //     { projection: { teams: 1 } }
    //   )
    
    // Mock data for now
    const teams: Team[] = [
      {
        _id: "team1",
        name: "Team Alpha",
        members: ["user1@example.com", "user2@example.com"],
        isApproved: true,
        registeredAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      }
    ]

    return {
      success: true,
      teams
    }
  } catch (error) {
    console.error("Error fetching teams:", error)
    return {
      success: false,
      error: "Failed to fetch teams",
      teams: []
    }
  }
}
