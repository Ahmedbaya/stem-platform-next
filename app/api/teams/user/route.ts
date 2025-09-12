import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get all teams where user is either a member or leader
    const teams = await db
      .collection("teams")
      .find({
        $or: [
          { members: session.user.email },
          { leader: session.user.email }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Get all competition IDs
    const competitionIds = Array.from(new Set(teams.map(t => t.competitionId)))
    
    // Get competition details
    const competitions = await db
      .collection("competitions")
      .find({ 
        _id: { 
          $in: competitionIds.map(id => {
            try {
              return typeof id === 'string' ? new ObjectId(id) : id
            } catch {
              return id
            }
          })
        } 
      })
      .toArray()

    // Create a map of competition IDs to titles
    const competitionTitles = new Map(
      competitions.map(comp => [comp._id.toString(), comp.title])
    )

    // Get all unique member emails (including leaders)
    const memberEmails = Array.from(new Set(teams.flatMap(t => [t.leader, ...t.members])))
    
    // Get all member names
    const users = await db
      .collection("users")
      .find({ email: { $in: memberEmails } })
      .toArray()
    
    const userNames = new Map(users.map((u) => [u.email, u.name]))

    // Map competition titles and names to teams
    const formattedTeams = teams.map((team) => ({
      ...team,
      _id: team._id.toString(),
      competitionTitle: competitionTitles.get(team.competitionId) || "Unknown Competition",
      leaderName: userNames.get(team.leader) || "Unknown User",
      memberNames: team.members.map((email: string) => userNames.get(email) || "Unknown User"),
      // Only include code if team is approved
      code: team.status === "approved" ? team.code : undefined
    }))

    return NextResponse.json({ teams: formattedTeams })
  } catch (error) {
    console.error("[TEAMS_USER]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 