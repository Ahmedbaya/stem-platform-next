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

    if ((session.user as any).role !== "organizer") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get all competitions organized by this user
    const competitions = await db
      .collection("competitions")
      .find({ organizerId: session.user.email })
      .toArray()

    const competitionIds = competitions.map((c) => c._id)

    // Get all teams for these competitions that are pending approval
    const teams = await db
      .collection("teams")
      .find({ 
        competitionId: { 
          $in: competitionIds.map(id => new ObjectId(id.toString()))
        },
        status: "pending"
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    console.log("Found pending teams:", teams)

    // Get all unique member emails (including leaders)
    const memberEmails = Array.from(new Set(teams.flatMap(t => [t.leader, ...t.members])))
    
    // Get all member names
    const users = await db
      .collection("users")
      .find({ email: { $in: memberEmails } })
      .toArray()
    
    const userNames = new Map(users.map((u) => [u.email, u.name]))

    // Map competition titles and names to teams
    const formattedTeams = teams.map((team) => {
      const competition = competitions.find(c => c._id.toString() === team.competitionId.toString())
      return {
        ...team,
        _id: team._id.toString(),
        competitionId: team.competitionId.toString(),
        competitionTitle: competition?.title || "Unknown Competition",
        leaderName: userNames.get(team.leader) || "Unknown User",
        memberNames: team.members.map((email: string) => userNames.get(email) || "Unknown User")
      }
    })

    console.log("Formatted teams:", formattedTeams)

    return NextResponse.json({ teams: formattedTeams })
  } catch (error) {
    console.error("[TEAMS_PENDING]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 